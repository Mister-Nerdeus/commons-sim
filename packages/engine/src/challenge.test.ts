import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ScenarioSchema } from "@commons-sim/shared";
import { assessCapacity } from "./capacity.js";
import { assessCashflow } from "./cashflow.js";
import { simulateScenario } from "./simulate.js";
import { runChallengeStressTests } from "./stress.js";

function repoRoot() {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(thisDir, "../../..");
}

const scenario = ScenarioSchema.parse(
  JSON.parse(fs.readFileSync(path.join(repoRoot(), "scenarios/baseline-48.json"), "utf-8")),
);

test("assessCapacity reports service capacity lines", () => {
  const capacity = assessCapacity(scenario);
  assert.equal(capacity.scenarioId, scenario.id);
  assert.equal(capacity.lines.length, 3);
  assert.ok(capacity.lines.every((line) => line.capacityPerMonth > 0));
});

test("assessCashflow separates upfront capital from operating cash", () => {
  const output = simulateScenario(scenario);
  const cashflow = assessCashflow(scenario, output.summary, 150000);

  assert.equal(cashflow.scenarioId, scenario.id);
  assert.equal(cashflow.upfrontCapitalUsd, 107000);
  assert.equal(cashflow.budgetCapPassed, true);
  assert.ok(cashflow.projectedOperatingCashUsd > cashflow.upfrontCapitalUsd);
});

test("runChallengeStressTests returns deterministic stress summaries", () => {
  const first = runChallengeStressTests(scenario);
  const second = runChallengeStressTests(scenario);

  assert.equal(first.length, 4);
  assert.deepEqual(first, second);
});
