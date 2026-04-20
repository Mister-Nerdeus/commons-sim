import type { Scenario } from "@commons-sim/shared";

export type LaborBreakdown = {
  mealLaborHours: number;
  laundryLaborHours: number;
  cleaningLaborHours: number;
  laborHoursRaw: number;
  laborHours: number;
  laborCost: number;
};

export type LaborInputs = {
  sharedMealsPerMonth: number;
  laundryLoadsPerMonth: number;
  cleaningHours: number;
  inefficiency: number;
};

export function computeLabor(s: Scenario, inputs: LaborInputs): LaborBreakdown {
  const mealLaborHours = (inputs.sharedMealsPerMonth / 120) * 8;
  const laundryLaborHours = inputs.laundryLoadsPerMonth * 0.15;
  const cleaningLaborHours = inputs.cleaningHours;

  const laborHoursRaw = (mealLaborHours + laundryLaborHours + cleaningLaborHours) * inputs.inefficiency;
  const laborHours = laborHoursRaw * s.wageModel.overheadMultiplier;
  const laborCost = laborHours * s.wageModel.fullyLoadedUsdPerHour;

  return {
    mealLaborHours,
    laundryLaborHours,
    cleaningLaborHours,
    laborHoursRaw,
    laborHours,
    laborCost,
  };
}
