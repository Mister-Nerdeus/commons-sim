import type { CreatedIdentity, IdentityRecord } from "./auth.js";
import type { LeaderboardRecord, ReviewStatus } from "./resultStore.js";
import type { SeasonRecord } from "./seasonStore.js";
import type { ChallengeResult } from "@commons-sim/shared";

export type PublicIdentityRecord = Omit<IdentityRecord, "secretHash" | "identitySecret">;

export type StorageHealth = {
  backend: "json" | "postgres";
  ok: boolean;
  details?: Record<string, unknown>;
};

export type StorageMetrics = {
  backend: "json" | "postgres";
  identities: number;
  seasons: number;
  leaderboardEntries: number;
  pendingReviews: number;
  finalists: number;
};

export type StorageAdapter = {
  readonly backend: "json" | "postgres";
  createIdentity(label: string): Promise<CreatedIdentity>;
  listIdentities(): Promise<PublicIdentityRecord[]>;
  findIdentity(identityId: string): Promise<IdentityRecord | undefined>;
  listSeasons(): Promise<SeasonRecord[]>;
  upsertSeason(season: SeasonRecord): Promise<SeasonRecord>;
  findActiveSeason(benchmarkId: string): Promise<SeasonRecord | undefined>;
  saveChallengeResult(result: ChallengeResult, metadata: { identityId: string; seasonId: string; submittedAtUtc?: string }): Promise<LeaderboardRecord>;
  listLeaderboardRecords(benchmarkId: string, seasonId?: string): Promise<LeaderboardRecord[]>;
  updateReviewStatus(
    benchmarkId: string,
    submissionId: string,
    seasonId: string | undefined,
    status: ReviewStatus,
    note: string,
  ): Promise<LeaderboardRecord | undefined>;
  health(): Promise<StorageHealth>;
  metrics(): Promise<StorageMetrics>;
  close?(): Promise<void>;
};
