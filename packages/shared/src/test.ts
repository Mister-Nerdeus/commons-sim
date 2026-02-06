import test from "node:test";
import assert from "node:assert/strict";
import { ScenarioSchema } from "./scenarioSchema";

test("ScenarioSchema parses baseline shape", () => {
  const s = ScenarioSchema.parse({
    version: 1,
    id: "t",
    title: "t",
    householdCount: 1,
    householdMix: { singles: 1, couples: 0, families: 0 },
    participation: { meals: 0, laundry: 0, cleaning: 0 },
    serviceTiers: { meals: 0, laundry: 0, cleaning: 0 },
    wageModel: { fullyLoadedUsdPerHour: 25 },
    utilities: { electricity_kwh: 0.2, water_gal: 0.01, sewer_gal: 0.01 }
  });
  assert.equal(s.householdCount, 1);
});
