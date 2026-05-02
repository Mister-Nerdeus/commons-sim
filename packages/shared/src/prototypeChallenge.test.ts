import test from "node:test";
import assert from "node:assert/strict";
import { buildStarterScenario } from "./planningWizard.js";
import { scorePrototypeChallenge } from "./prototypeChallenge.js";

const baseline = {
  avgCostPerHouseholdUsd: 1000,
  avgLaborHoursPerMonth: 500,
  reserveEndUsd: 25000,
  avgBurnoutIndex: 0.25,
};

test("scorePrototypeChallenge is deterministic for the same inputs", () => {
  const scenario = buildStarterScenario("starter-family-48");
  const candidate = {
    avgCostPerHouseholdUsd: 850,
    avgLaborHoursPerMonth: 480,
    reserveEndUsd: 50000,
    avgBurnoutIndex: 0.2,
  };

  assert.deepEqual(
    scorePrototypeChallenge(baseline, candidate, scenario),
    scorePrototypeChallenge(baseline, candidate, scenario),
  );
});

test("scorePrototypeChallenge rewards prototype-ready candidates", () => {
  const scenario = buildStarterScenario("starter-family-48");
  const candidate = {
    avgCostPerHouseholdUsd: 700,
    avgLaborHoursPerMonth: 420,
    reserveEndUsd: 80000,
    avgBurnoutIndex: 0.1,
  };

  const score = scorePrototypeChallenge(baseline, candidate, scenario);

  assert.equal(score.prototypeReady, true);
  assert.equal(score.rankLabel, "Prototype-ready");
  assert.ok(score.totalScore >= 70);
});

test("scorePrototypeChallenge blocks high-risk candidates from prototype-ready status", () => {
  const scenario = buildStarterScenario("starter-lean-18");
  const candidate = {
    avgCostPerHouseholdUsd: 1250,
    avgLaborHoursPerMonth: 900,
    reserveEndUsd: -5000,
    avgBurnoutIndex: 0.85,
  };

  const score = scorePrototypeChallenge(baseline, candidate, scenario);

  assert.equal(score.prototypeReady, false);
  assert.ok(score.riskPenalty > 0);
  assert.ok(score.gates.some((gate) => !gate.passed));
});
