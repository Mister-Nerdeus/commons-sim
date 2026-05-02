import { z } from "zod";
import { ScenarioSchema } from "./scenarioSchema.js";

export const ChallengeBenchmarkSchema = z.object({
  benchmarkVersion: z.literal(1),
  id: z.string().min(1),
  title: z.string().min(1),
  benchmarkClassId: z.string().min(1),
  lockedScenario: ScenarioSchema,
  pricePackId: z.string().min(1).default("us-default-2026"),
  equipmentCatalogId: z.string().min(1).default("community-services-v1"),
  regulatoryPackId: z.string().min(1).default("us-generic-planning-v1"),
  scoringProfileId: z.string().min(1).default("prototype-challenge-v1"),
  budgetCapUsd: z.number().nonnegative(),
  minimumTargets: z.object({
    maxAvgCostPerHouseholdUsd: z.number().nonnegative(),
    minReserveMonths: z.number().nonnegative(),
    maxBurnoutIndex: z.number().min(0).max(1),
    minMealCoverage: z.number().min(0).max(1),
    minLaundryCoverage: z.number().min(0).max(1),
  }),
});

export const ChallengeSubmissionSchema = z.object({
  submissionVersion: z.literal(1),
  id: z.string().min(1),
  benchmarkId: z.string().min(1),
  title: z.string().min(1),
  authorDisplayName: z.string().min(1),
  createdAtUtc: z.string().datetime(),
  proposedScenario: ScenarioSchema,
  designNotes: z.string().min(1),
  declaredRisks: z.array(z.string().min(1)).default([]),
});

export const ChallengeScoreComponentSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  score: z.number(),
  maxScore: z.number().positive(),
  rationale: z.string().min(1),
});

export const ChallengeReadinessGateSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  passed: z.boolean(),
  detail: z.string().min(1),
});

export const ChallengeResultSchema = z.object({
  resultVersion: z.literal(1),
  submissionId: z.string().min(1),
  benchmarkId: z.string().min(1),
  benchmarkClassId: z.string().min(1),
  engineVersion: z.string().min(1),
  modelVersion: z.string().min(1),
  scoringVersion: z.string().min(1),
  inputHash: z.string().min(1),
  outputHash: z.string().min(1),
  totalScore: z.number().min(0).max(100),
  maxScore: z.number().positive(),
  componentScores: z.array(ChallengeScoreComponentSchema),
  readinessGates: z.array(ChallengeReadinessGateSchema),
  capacity: z.unknown(),
  cashflow: z.unknown(),
  stressResults: z.array(z.unknown()),
  prototypePackageReady: z.boolean(),
  validation: z.object({
    ok: z.boolean(),
    violations: z.array(
      z.object({
        field: z.string().min(1),
        expected: z.unknown(),
        actual: z.unknown(),
      }),
    ),
  }),
});

export type ChallengeBenchmark = z.infer<typeof ChallengeBenchmarkSchema>;
export type ChallengeSubmission = z.infer<typeof ChallengeSubmissionSchema>;
export type ChallengeResultScoreComponent = z.infer<typeof ChallengeScoreComponentSchema>;
export type ChallengeReadinessGate = z.infer<typeof ChallengeReadinessGateSchema>;
export type ChallengeResult = z.infer<typeof ChallengeResultSchema>;

export type ChallengeLockViolation = {
  field: string;
  expected: unknown;
  actual: unknown;
};

export function validateChallengeSubmission(
  benchmark: ChallengeBenchmark,
  submission: ChallengeSubmission,
): { ok: boolean; violations: ChallengeLockViolation[] } {
  const expected = benchmark.lockedScenario;
  const actual = submission.proposedScenario;
  const violations: ChallengeLockViolation[] = [];

  if (submission.benchmarkId !== benchmark.id) {
    violations.push({ field: "benchmarkId", expected: benchmark.id, actual: submission.benchmarkId });
  }

  compare("version", expected.version, actual.version, violations);
  compare("horizonMonths", expected.horizonMonths, actual.horizonMonths, violations);
  compare("timestep", expected.timestep, actual.timestep, violations);
  compare("householdCount", expected.householdCount, actual.householdCount, violations);
  compare("householdMix", expected.householdMix, actual.householdMix, violations);
  compare("occupantsPerType", expected.occupantsPerType, actual.occupantsPerType, violations);
  compare("wageModel", expected.wageModel, actual.wageModel, violations);
  compare("utilities", expected.utilities, actual.utilities, violations);

  return {
    ok: violations.length === 0,
    violations,
  };
}

function compare(field: string, expected: unknown, actual: unknown, violations: ChallengeLockViolation[]) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    violations.push({ field, expected, actual });
  }
}
