import test from "node:test";
import assert from "node:assert/strict";
import { ScenarioSchema } from "./scenarioSchema.js";

test("ScenarioSchema parses baseline shape", () => {
  const s = ScenarioSchema.parse({
    version: 1,
    id: "t",
    title: "t",
    seed: 1,
    horizonMonths: 1,
    timestep: "month",
    householdCount: 1,
    householdMix: { singles: 1, couples: 0, families: 0 },
    occupantsPerType: { single: 1, couple: 2, family: 4.5 },
    participation: { meals: 0, laundry: 0, cleaning: 0 },
    serviceTiers: { meals: 0, laundry: 0, cleaning: 0 },
    wageModel: { fullyLoadedUsdPerHour: 25, overheadMultiplier: 1.1 },
    utilities: { electricity_kwh: 0.2, water_gal: 0.01, sewer_gal: 0.01 },
    equipment: [],
    reservePolicy: { initialReserveUsd: 0, targetMonthsOfOpex: 3, maxReserveUsd: 1000 },
  });
  assert.equal(s.householdCount, 1);
});
