import type { Scenario } from "@commons-sim/shared";
import { simulateScenario } from "./simulate.js";

export type SensitivityRun = {
  key: "wage" | "utilities" | "participation";
  delta: number;
  summary: {
    avgCostPerHouseholdUsd: number;
    avgLaborHoursPerMonth: number;
    reserveEndUsd: number;
    avgBurnoutIndex: number;
  };
};

export type SensitivityResult = {
  scenarioId: string;
  seed: number;
  baseSummary: SensitivityRun["summary"];
  runs: SensitivityRun[];
};

const DEFAULT_DELTAS = [-0.1, 0.1];

export function runSensitivity(scenario: Scenario, deltas: number[] = DEFAULT_DELTAS): SensitivityResult {
  const base = simulateScenario(scenario);
  const runs: SensitivityRun[] = [];

  for (const delta of deltas) {
    const wageScenario: Scenario = {
      ...scenario,
      wageModel: {
        ...scenario.wageModel,
        fullyLoadedUsdPerHour: round2(scenario.wageModel.fullyLoadedUsdPerHour * (1 + delta)),
      },
    };
    runs.push({
      key: "wage",
      delta,
      summary: simulateScenario(wageScenario).summary,
    });

    const utilityScenario: Scenario = {
      ...scenario,
      utilities: {
        ...scenario.utilities,
        electricity_kwh: round4(scenario.utilities.electricity_kwh * (1 + delta)),
        water_gal: round4(scenario.utilities.water_gal * (1 + delta)),
        sewer_gal: round4(scenario.utilities.sewer_gal * (1 + delta)),
        gas_therm:
          scenario.utilities.gas_therm === undefined
            ? undefined
            : round4(scenario.utilities.gas_therm * (1 + delta)),
      },
    };
    runs.push({
      key: "utilities",
      delta,
      summary: simulateScenario(utilityScenario).summary,
    });

    const participationScenario: Scenario = {
      ...scenario,
      participation: {
        meals: clamp01(scenario.participation.meals * (1 + delta)),
        laundry: clamp01(scenario.participation.laundry * (1 + delta)),
        cleaning: clamp01(scenario.participation.cleaning * (1 + delta)),
      },
    };
    runs.push({
      key: "participation",
      delta,
      summary: simulateScenario(participationScenario).summary,
    });
  }

  return {
    scenarioId: scenario.id,
    seed: scenario.seed,
    baseSummary: base.summary,
    runs,
  };
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(4))));
}

function round2(value: number) {
  return Number(value.toFixed(2));
}

function round4(value: number) {
  return Number(value.toFixed(4));
}
