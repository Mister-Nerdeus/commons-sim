import { ScenarioSchema, type Scenario } from "./scenarioSchema.js";

export type StarterTemplateId = "starter-balanced-24" | "starter-family-48" | "starter-lean-18";

export function buildStarterScenario(templateId: StarterTemplateId): Scenario {
  const scenario: Scenario =
    templateId === "starter-balanced-24"
      ? {
          version: 1,
          id: "starter-balanced-24",
          title: "Starter Balanced 24",
          seed: 21,
          horizonMonths: 60,
          timestep: "month",
          householdCount: 24,
          householdMix: { singles: 8, couples: 8, families: 8 },
          occupantsPerType: { single: 1, couple: 2, family: 4.5 },
          participation: { meals: 0.7, laundry: 0.65, cleaning: 0.45 },
          serviceTiers: { meals: 2, laundry: 1, cleaning: 1 },
          wageModel: { fullyLoadedUsdPerHour: 27, overheadMultiplier: 1.14 },
          utilities: { electricity_kwh: 0.16, water_gal: 0.006, sewer_gal: 0.007, gas_therm: 1.2 },
          equipment: [],
          reservePolicy: { initialReserveUsd: 8000, targetMonthsOfOpex: 3, maxReserveUsd: 140000 },
        }
      : templateId === "starter-family-48"
        ? {
            version: 1,
            id: "starter-family-48",
            title: "Starter Family Focus 48",
            seed: 33,
            horizonMonths: 60,
            timestep: "month",
            householdCount: 48,
            householdMix: { singles: 8, couples: 14, families: 26 },
            occupantsPerType: { single: 1, couple: 2, family: 4.7 },
            participation: { meals: 0.82, laundry: 0.74, cleaning: 0.58 },
            serviceTiers: { meals: 2, laundry: 2, cleaning: 1 },
            wageModel: { fullyLoadedUsdPerHour: 29, overheadMultiplier: 1.18 },
            utilities: { electricity_kwh: 0.18, water_gal: 0.0068, sewer_gal: 0.0073, gas_therm: 1.33 },
            equipment: [],
            reservePolicy: { initialReserveUsd: 15000, targetMonthsOfOpex: 3, maxReserveUsd: 260000 },
          }
        : {
            version: 1,
            id: "starter-lean-18",
            title: "Starter Lean 18",
            seed: 13,
            horizonMonths: 60,
            timestep: "month",
            householdCount: 18,
            householdMix: { singles: 8, couples: 6, families: 4 },
            occupantsPerType: { single: 1, couple: 2, family: 4.2 },
            participation: { meals: 0.52, laundry: 0.55, cleaning: 0.32 },
            serviceTiers: { meals: 1, laundry: 1, cleaning: 1 },
            wageModel: { fullyLoadedUsdPerHour: 26, overheadMultiplier: 1.1 },
            utilities: { electricity_kwh: 0.15, water_gal: 0.0058, sewer_gal: 0.0062, gas_therm: 1.15 },
            equipment: [],
            reservePolicy: { initialReserveUsd: 5000, targetMonthsOfOpex: 2, maxReserveUsd: 95000 },
          };

  return ScenarioSchema.parse(scenario);
}
