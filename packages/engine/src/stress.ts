import type { Scenario } from "@commons-sim/shared";
import type { SimOutputs } from "./model.js";
import { simulateScenario } from "./simulate.js";

export type StressResult = {
  key: "wage-plus-15" | "utilities-plus-20" | "participation-plus-20" | "capex-plus-15";
  label: string;
  summary: SimOutputs["summary"];
};

export function runChallengeStressTests(scenario: Scenario): StressResult[] {
  return [
    {
      key: "wage-plus-15",
      label: "Wage +15%",
      summary: simulateScenario({
        ...scenario,
        wageModel: {
          ...scenario.wageModel,
          fullyLoadedUsdPerHour: round2(scenario.wageModel.fullyLoadedUsdPerHour * 1.15),
        },
      }).summary,
    },
    {
      key: "utilities-plus-20",
      label: "Utilities +20%",
      summary: simulateScenario({
        ...scenario,
        utilities: {
          electricity_kwh: round4(scenario.utilities.electricity_kwh * 1.2),
          water_gal: round4(scenario.utilities.water_gal * 1.2),
          sewer_gal: round4(scenario.utilities.sewer_gal * 1.2),
          gas_therm:
            scenario.utilities.gas_therm === undefined ? undefined : round4(scenario.utilities.gas_therm * 1.2),
        },
      }).summary,
    },
    {
      key: "participation-plus-20",
      label: "Participation +20%",
      summary: simulateScenario({
        ...scenario,
        participation: {
          meals: clamp01(scenario.participation.meals * 1.2),
          laundry: clamp01(scenario.participation.laundry * 1.2),
          cleaning: clamp01(scenario.participation.cleaning * 1.2),
        },
      }).summary,
    },
    {
      key: "capex-plus-15",
      label: "Capex +15%",
      summary: simulateScenario({
        ...scenario,
        equipment: scenario.equipment.map((item) => ({
          ...item,
          capexUsd: round2(item.capexUsd * 1.15),
        })),
      }).summary,
    },
  ];
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
