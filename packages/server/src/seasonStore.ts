import path from "node:path";
import { readJsonFile, writeJsonFileAtomic } from "./database.js";

export type SeasonRecord = {
  seasonId: string;
  title: string;
  benchmarkIds: string[];
  startsAtUtc: string;
  endsAtUtc: string | null;
  active: boolean;
};

type SeasonDb = {
  seasons: SeasonRecord[];
};

export function listSeasons(storageDir: string): SeasonRecord[] {
  const db = readSeasonDb(storageDir);
  if (db.seasons.length > 0) return db.seasons;
  const fallback = defaultSeason();
  writeSeasonDb(storageDir, { seasons: [fallback] });
  return [fallback];
}

export function upsertSeason(storageDir: string, season: SeasonRecord): SeasonRecord {
  const db = readSeasonDb(storageDir);
  const next = db.seasons.filter((item) => item.seasonId !== season.seasonId);
  next.push(season);
  writeSeasonDb(storageDir, { seasons: next.sort((a, b) => a.seasonId.localeCompare(b.seasonId)) });
  return season;
}

export function findActiveSeason(storageDir: string, benchmarkId: string): SeasonRecord | undefined {
  const now = Date.now();
  return listSeasons(storageDir).find((season) => {
    const starts = Date.parse(season.startsAtUtc);
    const ends = season.endsAtUtc ? Date.parse(season.endsAtUtc) : Number.POSITIVE_INFINITY;
    const benchmarkAllowed = season.benchmarkIds.length === 0 || season.benchmarkIds.includes(benchmarkId);
    return season.active && benchmarkAllowed && starts <= now && now <= ends;
  });
}

function seasonDbPath(storageDir: string) {
  return path.join(storageDir, "season-db.json");
}

function readSeasonDb(storageDir: string): SeasonDb {
  return readJsonFile(seasonDbPath(storageDir), { seasons: [] });
}

function writeSeasonDb(storageDir: string, db: SeasonDb) {
  writeJsonFileAtomic(seasonDbPath(storageDir), db);
}

function defaultSeason(): SeasonRecord {
  return {
    seasonId: "open-2026",
    title: "Open Prototype Challenge 2026",
    benchmarkIds: [],
    startsAtUtc: "2026-01-01T00:00:00.000Z",
    endsAtUtc: null,
    active: true,
  };
}
