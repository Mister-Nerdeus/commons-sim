import fs from "node:fs";
import path from "node:path";
import {
  createAnonymousIdentity,
  findIdentity,
  listIdentities,
  type CreatedIdentity,
  type IdentityRecord,
} from "./auth.js";
import {
  listLeaderboardRecords,
  saveChallengeResult,
  updateReviewStatus,
  type LeaderboardRecord,
  type ReviewStatus,
} from "./resultStore.js";
import { findActiveSeason, listSeasons, upsertSeason, type SeasonRecord } from "./seasonStore.js";
import type { StorageAdapter, StorageHealth, StorageMetrics, PublicIdentityRecord } from "./storage.js";
import type { ChallengeResult } from "@commons-sim/shared";

export class JsonStorageAdapter implements StorageAdapter {
  readonly backend = "json" as const;

  constructor(private readonly storageDir: string) {}

  async createIdentity(label: string): Promise<CreatedIdentity> {
    return createAnonymousIdentity(this.storageDir, label);
  }

  async listIdentities(): Promise<PublicIdentityRecord[]> {
    return listIdentities(this.storageDir);
  }

  async findIdentity(identityId: string): Promise<IdentityRecord | undefined> {
    return findIdentity(this.storageDir, identityId);
  }

  async listSeasons(): Promise<SeasonRecord[]> {
    return listSeasons(this.storageDir);
  }

  async upsertSeason(season: SeasonRecord): Promise<SeasonRecord> {
    return upsertSeason(this.storageDir, season);
  }

  async findActiveSeason(benchmarkId: string): Promise<SeasonRecord | undefined> {
    return findActiveSeason(this.storageDir, benchmarkId);
  }

  async saveChallengeResult(
    result: ChallengeResult,
    metadata: { identityId: string; seasonId: string; submittedAtUtc?: string },
  ): Promise<LeaderboardRecord> {
    return saveChallengeResult(this.storageDir, result, metadata);
  }

  async listLeaderboardRecords(benchmarkId: string, seasonId?: string): Promise<LeaderboardRecord[]> {
    return listLeaderboardRecords(this.storageDir, benchmarkId, seasonId);
  }

  async updateReviewStatus(
    benchmarkId: string,
    submissionId: string,
    seasonId: string | undefined,
    status: ReviewStatus,
    note: string,
  ): Promise<LeaderboardRecord | undefined> {
    return updateReviewStatus(this.storageDir, benchmarkId, submissionId, seasonId, status, note);
  }

  async health(): Promise<StorageHealth> {
    return { backend: this.backend, ok: true, details: { storageDir: this.storageDir } };
  }

  async metrics(): Promise<StorageMetrics> {
    const seasons = await this.listSeasons();
    const identities = await this.listIdentities();
    const records = this.listAllLeaderboardRecords();
    return {
      backend: this.backend,
      identities: identities.length,
      seasons: seasons.length,
      leaderboardEntries: records.length,
      pendingReviews: records.filter((record) => record.review.status === "pending").length,
      finalists: records.filter((record) => record.review.status === "finalist").length,
    };
  }

  private listAllLeaderboardRecords(): LeaderboardRecord[] {
    const root = path.join(path.resolve(this.storageDir), "leaderboards");
    if (!fs.existsSync(root)) return [];
    return fs
      .readdirSync(root, { withFileTypes: true })
      .filter((season) => season.isDirectory())
      .flatMap((season) => {
        const seasonDir = path.join(root, season.name);
        return fs
          .readdirSync(seasonDir, { withFileTypes: true })
          .filter((benchmark) => benchmark.isDirectory())
          .flatMap((benchmark) => listLeaderboardRecords(this.storageDir, benchmark.name, season.name));
      });
  }
}
