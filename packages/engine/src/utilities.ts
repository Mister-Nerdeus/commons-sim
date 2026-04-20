import type { Scenario } from "@commons-sim/shared";

export type UtilityOutputs = {
  electricityKwh: number;
  waterGal: number;
  sewerGal: number;
  gasTherm: number;
  utilityCost: number;
};

export function computeUtilities(s: Scenario, sharedMealsPerMonth: number, laundryLoadsPerMonth: number): UtilityOutputs {
  const electricityKwh = (sharedMealsPerMonth * 0.4 + laundryLoadsPerMonth * 0.7 + s.householdCount * 12) * 0.15;
  const waterGal = laundryLoadsPerMonth * 22 + sharedMealsPerMonth * 0.6 + s.householdCount * 900;
  const sewerGal = waterGal;
  const gasTherm = sharedMealsPerMonth * 0.05;

  const utilityCost =
    electricityKwh * s.utilities.electricity_kwh +
    waterGal * s.utilities.water_gal +
    sewerGal * s.utilities.sewer_gal +
    gasTherm * (s.utilities.gas_therm ?? 0);

  return {
    electricityKwh,
    waterGal,
    sewerGal,
    gasTherm,
    utilityCost,
  };
}
