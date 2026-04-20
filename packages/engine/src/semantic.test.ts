import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { simulateScenario } from "./simulate.js";

function loadBaseline() {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(thisDir, "../../..");
  const scenarioPath = path.join(repoRoot, "scenarios/baseline-48.json");
  return JSON.parse(fs.readFileSync(scenarioPath, "utf-8"));
}

test("reserve target months influences reserve trajectory", () => {
  const base = loadBaseline();
  const lowTarget = { ...base, reservePolicy: { ...base.reservePolicy, targetMonthsOfOpex: 1 } };
  const highTarget = { ...base, reservePolicy: { ...base.reservePolicy, targetMonthsOfOpex: 12 } };

  const lowOut = simulateScenario(lowTarget);
  const highOut = simulateScenario(highTarget);

  assert.notEqual(lowOut.summary.reserveEndUsd, highOut.summary.reserveEndUsd);
  assert.ok(highOut.summary.reserveEndUsd > lowOut.summary.reserveEndUsd);
});

test("gas_therm utility price affects total cost", () => {
  const base = loadBaseline();
  const gasLow = { ...base, utilities: { ...base.utilities, gas_therm: 0.0 } };
  const gasHigh = { ...base, utilities: { ...base.utilities, gas_therm: 10.0 } };

  const lowOut = simulateScenario(gasLow);
  const highOut = simulateScenario(gasHigh);

  assert.ok(highOut.summary.avgCostPerHouseholdUsd > lowOut.summary.avgCostPerHouseholdUsd);
});

test("burnout index increases under high workload", () => {
  const base = loadBaseline();
  const stressed = {
    ...base,
    householdCount: 10,
    householdMix: { singles: 10, couples: 0, families: 0 },
    participation: { meals: 1, laundry: 1, cleaning: 1 },
    serviceTiers: { meals: 3, laundry: 3, cleaning: 3 },
    wageModel: { ...base.wageModel, overheadMultiplier: 2.5 },
  };

  const out = simulateScenario(stressed);
  assert.ok(out.summary.avgBurnoutIndex > 0);
});
