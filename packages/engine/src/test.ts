import test from "node:test";
import assert from "node:assert/strict";
import { SimulationOutputSchema } from "@commons-sim/shared";
import { simulateScenario } from "./simulate.js";

test("simulateScenario is deterministic for same input", () => {
  const scenario: any = {
    version: 1,
    id: "d",
    title: "d",
    seed: 1,
    horizonMonths: 3,
    timestep: "month",
    householdCount: 2,
    householdMix: { singles: 2, couples: 0, families: 0 },
    occupantsPerType: { single: 1, couple: 2, family: 4.5 },
    participation: { meals: 0.5, laundry: 0.5, cleaning: 0.5 },
    serviceTiers: { meals: 1, laundry: 1, cleaning: 1 },
    wageModel: { fullyLoadedUsdPerHour: 25, overheadMultiplier: 1.1 },
    utilities: { electricity_kwh: 0.2, water_gal: 0.01, sewer_gal: 0.01 },
    equipment: [],
    reservePolicy: { initialReserveUsd: 0, targetMonthsOfOpex: 3, maxReserveUsd: 10000 }
  };
  const a = simulateScenario(scenario);
  const b = simulateScenario(scenario);
  assert.deepEqual(a, b);
  assert.equal(SimulationOutputSchema.safeParse(a).success, true);
});
