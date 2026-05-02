import type { Scenario } from "@commons-sim/shared";
import { computeMonthlyDemand } from "./demand.js";
import { deriveResidentCount } from "./model.js";
import { demandModelFromScenario } from "./tiers.js";

export type CapacityLine = {
  service: "meals" | "laundry" | "cleaning";
  demandPerMonth: number;
  capacityPerMonth: number;
  utilization: number;
  unmetDemand: number;
  passed: boolean;
  note: string;
};

export type CapacityAssessment = {
  scenarioId: string;
  passed: boolean;
  lines: CapacityLine[];
};

export function assessCapacity(scenario: Scenario): CapacityAssessment {
  const residents = deriveResidentCount(scenario);
  const demand = computeMonthlyDemand(scenario, residents, demandModelFromScenario(scenario));
  const kitchenCapex = capexByCategory(scenario, "kitchen");
  const laundryCapex = capexByCategory(scenario, "laundry");

  const lines: CapacityLine[] = [
    capacityLine(
      "meals",
      demand.sharedMealsPerMonth,
      kitchenCapex > 0 ? (kitchenCapex / 85000) * 12000 : scenario.householdCount * 80,
      kitchenCapex > 0
        ? "Kitchen capacity derived from commercial kitchen capex proxy."
        : "No kitchen asset declared; uses low fallback capacity.",
    ),
    capacityLine(
      "laundry",
      demand.laundryLoadsPerMonth,
      laundryCapex > 0 ? (laundryCapex / 22000) * 900 : scenario.householdCount * 8,
      laundryCapex > 0
        ? "Laundry capacity derived from laundry equipment capex proxy."
        : "No laundry asset declared; uses low fallback capacity.",
    ),
    capacityLine(
      "cleaning",
      demand.cleaningHours,
      scenario.householdCount * 8,
      "Cleaning capacity uses an eight-hour monthly service envelope per household.",
    ),
  ];

  return {
    scenarioId: scenario.id,
    passed: lines.every((line) => line.passed),
    lines,
  };
}

function capacityLine(
  service: CapacityLine["service"],
  demandPerMonth: number,
  capacityPerMonth: number,
  note: string,
): CapacityLine {
  const unmetDemand = Math.max(0, demandPerMonth - capacityPerMonth);
  return {
    service,
    demandPerMonth,
    capacityPerMonth,
    utilization: capacityPerMonth <= 0 ? 1 : demandPerMonth / capacityPerMonth,
    unmetDemand,
    passed: unmetDemand === 0,
    note,
  };
}

function capexByCategory(scenario: Scenario, category: Scenario["equipment"][number]["category"]) {
  return scenario.equipment
    .filter((item) => item.category === category)
    .reduce((sum, item) => sum + item.capexUsd, 0);
}
