import test from "node:test";
import assert from "node:assert/strict";
import { migrateProjectManifest } from "./projectMigrations.js";

test("migrateProjectManifest accepts v1 manifest", () => {
  const input = {
    manifestVersion: 1,
    projectId: "p1",
    projectTitle: "Project One",
    createdAtUtc: "2026-01-01T00:00:00Z",
    updatedAtUtc: "2026-01-01T00:00:00Z",
    sourceBranch: "develop",
    scenario: {
      version: 1,
      id: "s1",
      title: "Scenario One",
      seed: 1,
      horizonMonths: 12,
      timestep: "month",
      householdCount: 1,
      householdMix: { singles: 1, couples: 0, families: 0 },
      occupantsPerType: { single: 1, couple: 2, family: 4.5 },
      participation: { meals: 0.5, laundry: 0.5, cleaning: 0.5 },
      serviceTiers: { meals: 1, laundry: 1, cleaning: 1 },
      wageModel: { fullyLoadedUsdPerHour: 25, overheadMultiplier: 1.1 },
      utilities: { electricity_kwh: 0.2, water_gal: 0.01, sewer_gal: 0.01 },
      equipment: [],
      reservePolicy: { initialReserveUsd: 0, targetMonthsOfOpex: 3, maxReserveUsd: 1000 },
    },
    metadata: { notes: "", engineVersion: "0.1.0" },
  };

  const migrated = migrateProjectManifest(input);
  assert.equal(migrated.migratedFrom, null);
  assert.equal(migrated.manifest.manifestVersion, 1);
});

test("migrateProjectManifest upgrades legacy v0 manifest", () => {
  const legacy = {
    version: 0,
    id: "legacy-project",
    title: "Legacy Project",
    savedAtUtc: "2026-01-01T00:00:00Z",
    scenario: {
      version: 1,
      id: "legacy-scenario",
      title: "Legacy Scenario",
      seed: 1,
      horizonMonths: 12,
      timestep: "month",
      householdCount: 1,
      householdMix: { singles: 1, couples: 0, families: 0 },
      occupantsPerType: { single: 1, couple: 2, family: 4.5 },
      participation: { meals: 0.5, laundry: 0.5, cleaning: 0.5 },
      serviceTiers: { meals: 1, laundry: 1, cleaning: 1 },
      wageModel: { fullyLoadedUsdPerHour: 25, overheadMultiplier: 1.1 },
      utilities: { electricity_kwh: 0.2, water_gal: 0.01, sewer_gal: 0.01 },
      equipment: [],
      reservePolicy: { initialReserveUsd: 0, targetMonthsOfOpex: 3, maxReserveUsd: 1000 },
    },
  };

  const migrated = migrateProjectManifest(legacy);
  assert.equal(migrated.migratedFrom, 0);
  assert.equal(migrated.manifest.manifestVersion, 1);
  assert.match(migrated.manifest.metadata.notes, /Migrated from project manifest v0/);
});
