import test from "node:test";
import assert from "node:assert/strict";
import { buildStarterScenario } from "./planningWizard.js";
import {
  ChallengeBenchmarkSchema,
  ChallengeSubmissionSchema,
  validateChallengeSubmission,
} from "./challengeSchema.js";

function benchmark() {
  const lockedScenario = buildStarterScenario("starter-balanced-24");
  return ChallengeBenchmarkSchema.parse({
    benchmarkVersion: 1,
    id: "small-24",
    title: "Small 24 benchmark",
    benchmarkClassId: "small-24",
    lockedScenario,
    budgetCapUsd: 150000,
    minimumTargets: {
      maxAvgCostPerHouseholdUsd: 250,
      minReserveMonths: 2,
      maxBurnoutIndex: 0.6,
      minMealCoverage: 0.5,
      minLaundryCoverage: 0.5,
    },
  });
}

test("challenge submission validates against matching locked benchmark fields", () => {
  const b = benchmark();
  const submission = ChallengeSubmissionSchema.parse({
    submissionVersion: 1,
    id: "sub-1",
    benchmarkId: b.id,
    title: "Submission",
    authorDisplayName: "Player",
    createdAtUtc: "2026-05-01T00:00:00.000Z",
    proposedScenario: {
      ...b.lockedScenario,
      id: "sub-1-scenario",
      title: "Submission scenario",
      participation: { meals: 0.8, laundry: 0.75, cleaning: 0.5 },
    },
    designNotes: "Uses the same benchmark demand shape with higher service participation.",
    declaredRisks: ["Staffing plan still needs local review."],
  });

  assert.deepEqual(validateChallengeSubmission(b, submission), { ok: true, violations: [] });
});

test("challenge submission rejects edited locked demand fields", () => {
  const b = benchmark();
  const submission = ChallengeSubmissionSchema.parse({
    submissionVersion: 1,
    id: "sub-2",
    benchmarkId: b.id,
    title: "Bad Submission",
    authorDisplayName: "Player",
    createdAtUtc: "2026-05-01T00:00:00.000Z",
    proposedScenario: {
      ...b.lockedScenario,
      householdCount: 23,
      householdMix: { singles: 7, couples: 8, families: 8 },
    },
    designNotes: "Changed the benchmark size.",
    declaredRisks: [],
  });

  const result = validateChallengeSubmission(b, submission);
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((violation) => violation.field === "householdCount"));
});
