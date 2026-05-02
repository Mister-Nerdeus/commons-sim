import type { Scenario } from "./scenarioSchema.js";
import type { SummaryMetrics } from "./explainability.js";

export type ChallengeComponentKey =
  | "costSavings"
  | "familySupport"
  | "safetyResilience"
  | "fairness"
  | "sustainability"
  | "feasibility";

export type ChallengeScoreComponent = {
  key: ChallengeComponentKey;
  label: string;
  score: number;
  maxScore: number;
  rationale: string;
};

export type PrototypeReadinessGate = {
  key: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type PrototypeChallengeScore = {
  scenarioId: string;
  totalScore: number;
  maxScore: number;
  prototypeReady: boolean;
  components: ChallengeScoreComponent[];
  gates: PrototypeReadinessGate[];
  riskPenalty: number;
  rankLabel: "Prototype-ready" | "Promising" | "Needs work";
};

export function scorePrototypeChallenge(
  baseline: SummaryMetrics,
  candidate: SummaryMetrics,
  scenario: Scenario,
): PrototypeChallengeScore {
  const costSavingsRatio = safeRatio(baseline.avgCostPerHouseholdUsd - candidate.avgCostPerHouseholdUsd, baseline.avgCostPerHouseholdUsd);
  const serviceCoverage =
    (scenario.participation.meals + scenario.participation.laundry + scenario.participation.cleaning) / 3;
  const serviceTierCoverage =
    (scenario.serviceTiers.meals + scenario.serviceTiers.laundry + scenario.serviceTiers.cleaning) / 9;
  const familyShare = scenario.householdMix.families / scenario.householdCount;
  const participationSpread =
    Math.max(scenario.participation.meals, scenario.participation.laundry, scenario.participation.cleaning) -
    Math.min(scenario.participation.meals, scenario.participation.laundry, scenario.participation.cleaning);
  const reserveMonthsProxy = safeRatio(candidate.reserveEndUsd, candidate.avgCostPerHouseholdUsd * scenario.householdCount);
  const burnoutHealth = 1 - candidate.avgBurnoutIndex;

  const rawComponents: ChallengeScoreComponent[] = [
    {
      key: "costSavings",
      label: "Cost Savings",
      score: points(costSavingsRatio, 0.25, 25),
      maxScore: 25,
      rationale: "Rewards lower average monthly household cost against the baseline.",
    },
    {
      key: "familySupport",
      label: "Family Support",
      score: round1((familyShare * 0.35 + serviceCoverage * 0.4 + serviceTierCoverage * 0.25) * 20),
      maxScore: 20,
      rationale: "Rewards family-serving demand coverage through shared meals, laundry, and cleaning.",
    },
    {
      key: "safetyResilience",
      label: "Safety & Resilience",
      score: round1((clamp01(reserveMonthsProxy / 3) * 0.55 + burnoutHealth * 0.45) * 15),
      maxScore: 15,
      rationale: "Uses reserve strength and workload health as transparent resilience proxies.",
    },
    {
      key: "fairness",
      label: "Fairness",
      score: round1((1 - participationSpread * 0.7 - Math.max(0, costSavingsRatio * -1) * 0.8) * 15),
      maxScore: 15,
      rationale: "Rewards balanced participation and penalizes designs that raise household cost.",
    },
    {
      key: "sustainability",
      label: "Sustainability",
      score: round1((clamp01(costSavingsRatio / 0.15) * 0.45 + serviceCoverage * 0.35 + serviceTierCoverage * 0.2) * 10),
      maxScore: 10,
      rationale: "Rewards efficient shared services while leaving room for future energy and water modules.",
    },
    {
      key: "feasibility",
      label: "Feasibility",
      score: round1(
        (Number(candidate.reserveEndUsd > 0) * 0.3 +
          Number(candidate.avgBurnoutIndex <= 0.6) * 0.3 +
          Number(scenario.wageModel.overheadMultiplier <= 1.25) * 0.2 +
          Number(candidate.avgLaborHoursPerMonth <= scenario.householdCount * 14) * 0.2) *
          15,
      ),
      maxScore: 15,
      rationale: "Rewards reserve solvency, workload discipline, and plausible staffing overhead.",
    },
  ];
  const components: ChallengeScoreComponent[] = rawComponents.map((component) => ({
    ...component,
    score: clamp(component.score, 0, component.maxScore),
  }));

  const riskPenalty = round1(
    Math.max(0, candidate.avgBurnoutIndex - 0.6) * 20 +
      Math.max(0, -candidate.reserveEndUsd / 10000) +
      Math.max(0, -costSavingsRatio) * 12,
  );
  const rawScore = components.reduce((sum, component) => sum + component.score, 0) - riskPenalty;
  const totalScore = round1(clamp(rawScore, 0, 100));
  const gates = buildReadinessGates(baseline, candidate, scenario, totalScore);
  const prototypeReady = gates.every((gate) => gate.passed);

  return {
    scenarioId: scenario.id,
    totalScore,
    maxScore: 100,
    prototypeReady,
    components,
    gates,
    riskPenalty,
    rankLabel: prototypeReady ? "Prototype-ready" : totalScore >= 70 ? "Promising" : "Needs work",
  };
}

function buildReadinessGates(
  baseline: SummaryMetrics,
  candidate: SummaryMetrics,
  scenario: Scenario,
  totalScore: number,
): PrototypeReadinessGate[] {
  const costDelta = candidate.avgCostPerHouseholdUsd - baseline.avgCostPerHouseholdUsd;
  const hasEquipmentBudget = scenario.equipment.length > 0 || candidate.avgCostPerHouseholdUsd <= baseline.avgCostPerHouseholdUsd;

  return [
    {
      key: "budget",
      label: "Budget improves or holds",
      passed: costDelta <= 0,
      detail: costDelta <= 0 ? "Candidate does not raise average household cost." : "Candidate raises average household cost.",
    },
    {
      key: "staffing",
      label: "Staffing load is plausible",
      passed: candidate.avgBurnoutIndex <= 0.6,
      detail:
        candidate.avgBurnoutIndex <= 0.6
          ? "Burnout proxy stays below the challenge limit."
          : "Burnout proxy exceeds the challenge limit.",
    },
    {
      key: "reserve",
      label: "Reserve remains solvent",
      passed: candidate.reserveEndUsd > 0,
      detail: candidate.reserveEndUsd > 0 ? "Reserve remains positive over the horizon." : "Reserve is depleted.",
    },
    {
      key: "family",
      label: "Family-support services included",
      passed: scenario.participation.meals >= 0.5 && scenario.participation.laundry >= 0.5,
      detail:
        scenario.participation.meals >= 0.5 && scenario.participation.laundry >= 0.5
          ? "Meals and laundry participation clear the minimum support threshold."
          : "Meals and laundry participation need stronger coverage.",
    },
    {
      key: "implementation",
      label: "Implementation package is credible",
      passed: hasEquipmentBudget && totalScore >= 70,
      detail:
        hasEquipmentBudget && totalScore >= 70
          ? "Score and budget details are strong enough for a pilot package."
          : "Needs stronger score or a clearer capital/equipment plan.",
    },
  ];
}

function points(value: number, fullCreditAt: number, maxScore: number) {
  return round1(clamp01(value / fullCreditAt) * maxScore);
}

function safeRatio(numerator: number, denominator: number) {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function clamp01(value: number) {
  return clamp(value, 0, 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number) {
  return Number(value.toFixed(1));
}
