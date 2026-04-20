import test from "node:test";
import assert from "node:assert/strict";
import { runSensitivity } from "./sensitivity.js";

test("runSensitivity is deterministic for same scenario", () => {
  const scenario: any = {
    version: 1,
    id: "sens-1",
    title: "sens-1",
    seed: 11,
    horizonMonths: 12,
    timestep: "month",
    householdCount: 12,
    householdMix: { singles: 4, couples: 4, families: 4 },
    occupantsPerType: { single: 1, couple: 2, family: 4.5 },
    participation: { meals: 0.7, laundry: 0.6, cleaning: 0.5 },
    serviceTiers: { meals: 2, laundry: 1, cleaning: 1 },
    wageModel: { fullyLoadedUsdPerHour: 28, overheadMultiplier: 1.15 },
    utilities: { electricity_kwh: 0.16, water_gal: 0.006, sewer_gal: 0.007, gas_therm: 1.2 },
    equipment: [],
    reservePolicy: { initialReserveUsd: 2000, targetMonthsOfOpex: 3, maxReserveUsd: 25000 },
  };

  const a = runSensitivity(scenario);
  const b = runSensitivity(scenario);

  assert.deepEqual(a, b);
  assert.equal(a.runs.length, 6);
});
