import { randomBytes, randomUUID } from "node:crypto";
import pg, { type Pool, type PoolConfig } from "pg";
import { ChallengeResultSchema, type ChallengeResult } from "@commons-sim/shared";
import { hashSecret, type CreatedIdentity, type IdentityRecord } from "./auth.js";
import { runPostgresMigrations } from "./postgresMigrations.js";
import { type LeaderboardRecord, type ReviewStatus } from "./resultStore.js";
import { defaultSeason, type SeasonRecord } from "./seasonStore.js";
import type { PublicIdentityRecord, StorageAdapter, StorageHealth, StorageMetrics } from "./storage.js";

const { Pool: PgPool } = pg;

export type PostgresStorageOptions = {
  connectionString: string;
  migrationsDir?: string;
  pool?: Pool;
};

type IdentityRow = {
  identity_id: string;
  identity_secret: string;
  secret_hash: string;
  created_at_utc: Date | string;
  label: string;
  disabled: boolean;
};

type SeasonRow = {
  season_id: string;
  title: string;
  benchmark_ids: string[];
  starts_at_utc: Date | string;
  ends_at_utc: Date | string | null;
  active: boolean;
};

type LeaderboardRow = {
  season_id: string;
  benchmark_id: string;
  submission_id: string;
  identity_id: string;
  submitted_at_utc: Date | string;
  result: unknown;
  review_status: ReviewStatus;
  review_note: string;
  review_updated_at_utc: Date | string | null;
};

export class PostgresStorageAdapter implements StorageAdapter {
  readonly backend = "postgres" as const;
  private readonly pool: Pool;
  private readonly ownsPool: boolean;

  private constructor(pool: Pool, ownsPool: boolean) {
    this.pool = pool;
    this.ownsPool = ownsPool;
  }

  static async create(options: PostgresStorageOptions): Promise<PostgresStorageAdapter> {
    const pool = options.pool ?? new PgPool(poolConfig(options.connectionString));
    await runPostgresMigrations(pool, options.migrationsDir);
    const adapter = new PostgresStorageAdapter(pool, !options.pool);
    await adapter.ensureDefaultSeason();
    return adapter;
  }

  async createIdentity(label: string): Promise<CreatedIdentity> {
    const createdAtUtc = new Date().toISOString();
    const identitySecret = randomBytes(32).toString("base64url");
    const identityId = randomUUID();
    await this.pool.query(
      `
        insert into identities (identity_id, identity_secret, secret_hash, created_at_utc, label, disabled)
        values ($1, $2, $3, $4, $5, false)
      `,
      [identityId, identitySecret, hashSecret(identitySecret), createdAtUtc, label],
    );
    return { identityId, identitySecret, createdAtUtc, label };
  }

  async listIdentities(): Promise<PublicIdentityRecord[]> {
    const result = await this.pool.query<IdentityRow>(
      "select identity_id, identity_secret, secret_hash, created_at_utc, label, disabled from identities order by created_at_utc desc",
    );
    return result.rows.map((row) => {
      const record = mapIdentity(row);
      const { secretHash: _secretHash, identitySecret: _identitySecret, ...publicRecord } = record;
      return publicRecord;
    });
  }

  async findIdentity(identityId: string): Promise<IdentityRecord | undefined> {
    const result = await this.pool.query<IdentityRow>(
      "select identity_id, identity_secret, secret_hash, created_at_utc, label, disabled from identities where identity_id = $1",
      [identityId],
    );
    return result.rows[0] ? mapIdentity(result.rows[0]) : undefined;
  }

  async listSeasons(): Promise<SeasonRecord[]> {
    const result = await this.pool.query<SeasonRow>(
      "select season_id, title, benchmark_ids, starts_at_utc, ends_at_utc, active from seasons order by starts_at_utc desc, season_id",
    );
    if (result.rows.length > 0) return result.rows.map(mapSeason);
    await this.ensureDefaultSeason();
    return [defaultSeason()];
  }

  async upsertSeason(season: SeasonRecord): Promise<SeasonRecord> {
    await this.pool.query(
      `
        insert into seasons (season_id, title, benchmark_ids, starts_at_utc, ends_at_utc, active)
        values ($1, $2, $3, $4, $5, $6)
        on conflict (season_id) do update set
          title = excluded.title,
          benchmark_ids = excluded.benchmark_ids,
          starts_at_utc = excluded.starts_at_utc,
          ends_at_utc = excluded.ends_at_utc,
          active = excluded.active
      `,
      [season.seasonId, season.title, JSON.stringify(season.benchmarkIds), season.startsAtUtc, season.endsAtUtc, season.active],
    );
    return season;
  }

  async findActiveSeason(benchmarkId: string): Promise<SeasonRecord | undefined> {
    const now = new Date().toISOString();
    const result = await this.pool.query<SeasonRow>(
      `
        select season_id, title, benchmark_ids, starts_at_utc, ends_at_utc, active
        from seasons
        where active = true
          and starts_at_utc <= $1
          and (ends_at_utc is null or ends_at_utc >= $1)
          and (jsonb_array_length(benchmark_ids) = 0 or benchmark_ids ? $2)
        order by starts_at_utc desc, season_id
        limit 1
      `,
      [now, benchmarkId],
    );
    return result.rows[0] ? mapSeason(result.rows[0]) : undefined;
  }

  async saveChallengeResult(
    result: ChallengeResult,
    metadata: { identityId: string; seasonId: string; submittedAtUtc?: string },
  ): Promise<LeaderboardRecord> {
    const submittedAtUtc = metadata.submittedAtUtc ?? new Date().toISOString();
    await this.pool.query(
      `
        insert into leaderboard_entries (
          season_id,
          benchmark_id,
          submission_id,
          identity_id,
          submitted_at_utc,
          result,
          review_status,
          review_note,
          review_updated_at_utc
        )
        values ($1, $2, $3, $4, $5, $6, 'pending', '', null)
        on conflict (season_id, benchmark_id, submission_id) do update set
          identity_id = excluded.identity_id,
          submitted_at_utc = excluded.submitted_at_utc,
          result = excluded.result,
          review_status = 'pending',
          review_note = '',
          review_updated_at_utc = null
      `,
      [metadata.seasonId, result.benchmarkId, result.submissionId, metadata.identityId, submittedAtUtc, JSON.stringify(result)],
    );
    return {
      result,
      identityId: metadata.identityId,
      seasonId: metadata.seasonId,
      submittedAtUtc,
      review: { status: "pending", note: "", updatedAtUtc: null },
    };
  }

  async listLeaderboardRecords(benchmarkId: string, seasonId?: string): Promise<LeaderboardRecord[]> {
    const params = seasonId ? [benchmarkId, seasonId] : [benchmarkId];
    const result = await this.pool.query<LeaderboardRow>(
      `
        select season_id, benchmark_id, submission_id, identity_id, submitted_at_utc, result, review_status, review_note, review_updated_at_utc
        from leaderboard_entries
        where benchmark_id = $1
          ${seasonId ? "and season_id = $2" : ""}
        order by (result->>'totalScore')::numeric desc, review_status asc, submission_id asc
      `,
      params,
    );
    return result.rows.map(mapLeaderboardRecord);
  }

  async updateReviewStatus(
    benchmarkId: string,
    submissionId: string,
    seasonId: string | undefined,
    status: ReviewStatus,
    note: string,
  ): Promise<LeaderboardRecord | undefined> {
    const updatedAtUtc = new Date().toISOString();
    const params = seasonId
      ? [status, note, updatedAtUtc, benchmarkId, submissionId, seasonId]
      : [status, note, updatedAtUtc, benchmarkId, submissionId];
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const result = await client.query<LeaderboardRow>(
        `
          update leaderboard_entries
          set review_status = $1,
            review_note = $2,
            review_updated_at_utc = $3
          where ctid in (
            select ctid
            from leaderboard_entries
            where benchmark_id = $4
              and submission_id = $5
              ${seasonId ? "and season_id = $6" : ""}
            order by submitted_at_utc desc
            limit 1
          )
          returning season_id, benchmark_id, submission_id, identity_id, submitted_at_utc, result, review_status, review_note, review_updated_at_utc
        `,
        params,
      );
      const row = result.rows[0];
      if (!row) {
        await client.query("commit");
        return undefined;
      }
      await client.query("insert into audit_events (event_type, payload) values ($1, $2)", [
        "review_status_updated",
        JSON.stringify({
          benchmarkId,
          submissionId,
          seasonId: row.season_id,
          identityId: row.identity_id,
          status,
          note,
          updatedAtUtc,
        }),
      ]);
      await client.query("commit");
      return mapLeaderboardRecord(row);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async health(): Promise<StorageHealth> {
    try {
      const result = await this.pool.query<{ migrated: string }>("select max(applied_at_utc)::text as migrated from schema_migrations");
      return { backend: this.backend, ok: true, details: { latestMigrationAtUtc: result.rows[0]?.migrated ?? null } };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { backend: this.backend, ok: false, details: { error: message } };
    }
  }

  async metrics(): Promise<StorageMetrics> {
    const result = await this.pool.query<{
      identities: string;
      seasons: string;
      leaderboard_entries: string;
      pending_reviews: string;
      finalists: string;
    }>(`
      select
        (select count(*) from identities)::text as identities,
        (select count(*) from seasons)::text as seasons,
        (select count(*) from leaderboard_entries)::text as leaderboard_entries,
        (select count(*) from leaderboard_entries where review_status = 'pending')::text as pending_reviews,
        (select count(*) from leaderboard_entries where review_status = 'finalist')::text as finalists
    `);
    const row = result.rows[0]!;
    return {
      backend: this.backend,
      identities: Number(row.identities),
      seasons: Number(row.seasons),
      leaderboardEntries: Number(row.leaderboard_entries),
      pendingReviews: Number(row.pending_reviews),
      finalists: Number(row.finalists),
    };
  }

  async close(): Promise<void> {
    if (this.ownsPool) await this.pool.end();
  }

  private async ensureDefaultSeason(): Promise<void> {
    const count = await this.pool.query<{ count: string }>("select count(*)::text as count from seasons");
    if (Number(count.rows[0]?.count ?? 0) === 0) {
      await this.upsertSeason(defaultSeason());
    }
  }
}

function poolConfig(connectionString: string): PoolConfig {
  return {
    connectionString,
    max: Number(process.env.COMMONS_SIM_PG_POOL_MAX ?? 10),
    idleTimeoutMillis: Number(process.env.COMMONS_SIM_PG_IDLE_TIMEOUT_MS ?? 30_000),
  };
}

function mapIdentity(row: IdentityRow): IdentityRecord {
  return {
    identityId: row.identity_id,
    identitySecret: row.identity_secret,
    secretHash: row.secret_hash,
    createdAtUtc: asIso(row.created_at_utc),
    label: row.label,
    disabled: row.disabled,
  };
}

function mapSeason(row: SeasonRow): SeasonRecord {
  return {
    seasonId: row.season_id,
    title: row.title,
    benchmarkIds: Array.isArray(row.benchmark_ids) ? row.benchmark_ids : [],
    startsAtUtc: asIso(row.starts_at_utc),
    endsAtUtc: row.ends_at_utc ? asIso(row.ends_at_utc) : null,
    active: row.active,
  };
}

function mapLeaderboardRecord(row: LeaderboardRow): LeaderboardRecord {
  return {
    result: ChallengeResultSchema.parse(row.result),
    identityId: row.identity_id,
    seasonId: row.season_id,
    submittedAtUtc: asIso(row.submitted_at_utc),
    review: {
      status: row.review_status,
      note: row.review_note,
      updatedAtUtc: row.review_updated_at_utc ? asIso(row.review_updated_at_utc) : null,
    },
  };
}

function asIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
