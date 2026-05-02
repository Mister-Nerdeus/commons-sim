import {
  assessCapacity,
  assessCashflow,
  runChallengeStressTests,
  simulateScenario,
} from "@commons-sim/engine";
import {
  ChallengeResultSchema,
  scorePrototypeChallenge,
  validateChallengeSubmission,
  type ChallengeBenchmark,
  type ChallengeReadinessGate,
  type ChallengeResult,
  type ChallengeSubmission,
} from "@commons-sim/shared";
import { sha256, stableStringify } from "./json.js";

export function buildChallengeResult(benchmark: ChallengeBenchmark, submission: ChallengeSubmission): ChallengeResult {
  const validation = validateChallengeSubmission(benchmark, submission);
  const baselineOutput = simulateScenario(benchmark.lockedScenario);
  const candidateOutput = simulateScenario(submission.proposedScenario);
  const challengeScore = scorePrototypeChallenge(
    baselineOutput.summary,
    candidateOutput.summary,
    submission.proposedScenario,
  );
  const capacity = assessCapacity(submission.proposedScenario);
  const cashflow = assessCashflow(submission.proposedScenario, candidateOutput.summary, benchmark.budgetCapUsd);
  const stressResults = runChallengeStressTests(submission.proposedScenario);
  const targetGates = benchmarkTargetGates(
    benchmark,
    candidateOutput.summary,
    submission.proposedScenario.householdCount,
  );
  const readinessGates: ChallengeReadinessGate[] = [
    ...challengeScore.gates,
    ...targetGates,
    {
      key: "locked-fields",
      label: "Locked benchmark fields unchanged",
      passed: validation.ok,
      detail: validation.ok
        ? "Submission preserves locked benchmark fields."
        : `Submission changed ${validation.violations.length} locked field(s).`,
    },
    {
      key: "capacity",
      label: "Capacity covers modeled demand",
      passed: capacity.passed,
      detail: capacity.passed ? "All modeled service demand clears capacity." : "One or more services exceed capacity.",
    },
    {
      key: "capital-budget",
      label: "Upfront capital fits budget cap",
      passed: cashflow.budgetCapPassed,
      detail: cashflow.budgetCapPassed
        ? "Upfront capital stays inside the benchmark budget cap."
        : "Upfront capital exceeds the benchmark budget cap.",
    },
  ];
  const outputEnvelope = {
    candidateOutput,
    capacity,
    cashflow,
    stressResults,
  };

  return ChallengeResultSchema.parse({
    resultVersion: 1,
    submissionId: submission.id,
    benchmarkId: benchmark.id,
    benchmarkClassId: benchmark.benchmarkClassId,
    engineVersion: candidateOutput.meta.engineVersion,
    modelVersion: candidateOutput.meta.modelVersion,
    scoringVersion: benchmark.scoringProfileId,
    inputHash: sha256(stableStringify({ benchmark, submission })),
    outputHash: sha256(stableStringify(outputEnvelope)),
    totalScore: validation.ok ? challengeScore.totalScore : 0,
    maxScore: challengeScore.maxScore,
    componentScores: challengeScore.components,
    readinessGates,
    capacity,
    cashflow,
    stressResults,
    prototypePackageReady: readinessGates.every((gate) => gate.passed),
    validation,
  });
}

function benchmarkTargetGates(
  benchmark: ChallengeBenchmark,
  summary: ReturnType<typeof simulateScenario>["summary"],
  householdCount: number,
): ChallengeReadinessGate[] {
  const reserveMonths =
    summary.avgCostPerHouseholdUsd <= 0
      ? 0
      : summary.reserveEndUsd / (summary.avgCostPerHouseholdUsd * householdCount);
  return [
    {
      key: "target-cost",
      label: "Benchmark cost target",
      passed: summary.avgCostPerHouseholdUsd <= benchmark.minimumTargets.maxAvgCostPerHouseholdUsd,
      detail: `Average household cost must be <= ${benchmark.minimumTargets.maxAvgCostPerHouseholdUsd.toFixed(2)}.`,
    },
    {
      key: "target-reserve",
      label: "Benchmark reserve target",
      passed: reserveMonths >= benchmark.minimumTargets.minReserveMonths,
      detail: `Reserve months proxy is ${reserveMonths.toFixed(2)}; target is ${benchmark.minimumTargets.minReserveMonths.toFixed(2)}.`,
    },
    {
      key: "target-burnout",
      label: "Benchmark burnout target",
      passed: summary.avgBurnoutIndex <= benchmark.minimumTargets.maxBurnoutIndex,
      detail: `Burnout proxy must be <= ${benchmark.minimumTargets.maxBurnoutIndex.toFixed(2)}.`,
    },
  ];
}
