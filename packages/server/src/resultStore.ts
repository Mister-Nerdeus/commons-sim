import fs from "node:fs";
import path from "node:path";
import { ChallengeResultSchema, type ChallengeResult } from "@commons-sim/shared";
import { readJsonFile, writeJsonFileAtomic } from "./database.js";

export type ReviewStatus = "pending" | "finalist" | "approved" | "rejected";

export type LeaderboardRecord = {
  result: ChallengeResult;
  identityId: string;
  seasonId: string;
  submittedAtUtc: string;
  review: {
    status: ReviewStatus;
    note: string;
    updatedAtUtc: string | null;
  };
};

export function saveChallengeResult(
  storageDir: string,
  result: ChallengeResult,
  metadata: { identityId: string; seasonId: string; submittedAtUtc?: string },
): LeaderboardRecord {
  const record: LeaderboardRecord = {
    result,
    identityId: metadata.identityId,
    seasonId: metadata.seasonId,
    submittedAtUtc: metadata.submittedAtUtc ?? new Date().toISOString(),
    review: {
      status: "pending",
      note: "",
      updatedAtUtc: null,
    },
  };
  writeLeaderboardRecord(storageDir, record);
  return record;
}

export function writeLeaderboardRecord(storageDir: string, record: LeaderboardRecord): void {
  const dir = leaderboardDir(storageDir, record.seasonId, record.result.benchmarkId);
  fs.mkdirSync(dir, { recursive: true });
  writeJsonFileAtomic(path.join(dir, `${safeName(record.result.submissionId)}.json`), record);
}

export function listLeaderboardRecords(
  storageDir: string,
  benchmarkId: string,
  seasonId: string | undefined,
): LeaderboardRecord[] {
  const seasonIds = seasonId ? [seasonId] : listSeasonIds(storageDir);
  return seasonIds
    .flatMap((id) => listLeaderboardRecordsForSeason(storageDir, benchmarkId, id))
    .sort(
      (a, b) =>
        b.result.totalScore - a.result.totalScore ||
        a.review.status.localeCompare(b.review.status) ||
        a.result.submissionId.localeCompare(b.result.submissionId),
    );
}

export function listChallengeResults(storageDir: string, benchmarkId: string, seasonId?: string): ChallengeResult[] {
  return listLeaderboardRecords(storageDir, benchmarkId, seasonId).map((record) => record.result);
}

export function findLeaderboardRecord(
  storageDir: string,
  benchmarkId: string,
  submissionId: string,
  seasonId: string | undefined,
): LeaderboardRecord | undefined {
  return listLeaderboardRecords(storageDir, benchmarkId, seasonId).find(
    (record) => record.result.submissionId === submissionId,
  );
}

export function updateReviewStatus(
  storageDir: string,
  benchmarkId: string,
  submissionId: string,
  seasonId: string | undefined,
  status: ReviewStatus,
  note: string,
): LeaderboardRecord | undefined {
  const record = findLeaderboardRecord(storageDir, benchmarkId, submissionId, seasonId);
  if (!record) return undefined;
  const next: LeaderboardRecord = {
    ...record,
    review: {
      status,
      note,
      updatedAtUtc: new Date().toISOString(),
    },
  };
  writeLeaderboardRecord(storageDir, next);
  return next;
}

function listLeaderboardRecordsForSeason(storageDir: string, benchmarkId: string, seasonId: string): LeaderboardRecord[] {
  const dir = leaderboardDir(storageDir, seasonId, benchmarkId);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => parseRecord(path.join(dir, file), seasonId));
}

function parseRecord(filePath: string, seasonId: string): LeaderboardRecord {
  const parsed = readJsonFile<LeaderboardRecord | ChallengeResult>(filePath, undefined as never);
  if ("result" in parsed) return parsed;
  return {
    result: ChallengeResultSchema.parse(parsed),
    identityId: "legacy",
    seasonId,
    submittedAtUtc: "1970-01-01T00:00:00.000Z",
    review: {
      status: "pending",
      note: "",
      updatedAtUtc: null,
    },
  };
}

function listSeasonIds(storageDir: string): string[] {
  const root = path.join(path.resolve(storageDir), "leaderboards");
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .sort();
}

function leaderboardDir(storageDir: string, seasonId: string, benchmarkId: string) {
  return path.join(path.resolve(storageDir), "leaderboards", safeName(seasonId), safeName(benchmarkId));
}

function safeName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}
