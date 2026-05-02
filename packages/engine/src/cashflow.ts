import type { Scenario } from "@commons-sim/shared";
import type { SimOutputs } from "./model.js";

export type CashflowAssessment = {
  scenarioId: string;
  upfrontCapitalUsd: number;
  avgMonthlyOpexUsd: number;
  projectedOperatingCashUsd: number;
  totalCapitalAndOperatingUsd: number;
  budgetCapUsd: number;
  budgetRemainingUsd: number;
  budgetCapPassed: boolean;
  note: string;
};

export function assessCashflow(
  scenario: Scenario,
  summary: SimOutputs["summary"],
  budgetCapUsd: number,
): CashflowAssessment {
  const upfrontCapitalUsd = scenario.equipment.reduce((sum, item) => sum + item.capexUsd, 0);
  const avgMonthlyOpexUsd = summary.avgCostPerHouseholdUsd * scenario.householdCount;
  const projectedOperatingCashUsd = avgMonthlyOpexUsd * scenario.horizonMonths;
  const totalCapitalAndOperatingUsd = upfrontCapitalUsd + projectedOperatingCashUsd;
  const budgetRemainingUsd = budgetCapUsd - upfrontCapitalUsd;

  return {
    scenarioId: scenario.id,
    upfrontCapitalUsd,
    avgMonthlyOpexUsd,
    projectedOperatingCashUsd,
    totalCapitalAndOperatingUsd,
    budgetCapUsd,
    budgetRemainingUsd,
    budgetCapPassed: budgetRemainingUsd >= 0,
    note: "Budget cap is evaluated against upfront capital only; operating cash is reported separately.",
  };
}
