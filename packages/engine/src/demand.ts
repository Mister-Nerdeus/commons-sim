import type { Scenario } from "@commons-sim/shared";
import type { TierDemand } from "./tiers.js";

export type MonthlyDemand = {
  sharedMealsPerMonth: number;
  laundryLoadsPerMonth: number;
  cleaningHours: number;
};

export function computeMonthlyDemand(s: Scenario, residents: number, demand: TierDemand): MonthlyDemand {
  const sharedMealsPerDay = residents * demand.mealsPerResidentPerDay * s.participation.meals;
  const sharedMealsPerMonth = sharedMealsPerDay * 30;

  const participatingHouseholdsLaundry = s.householdCount * s.participation.laundry;
  const laundryLoadsPerMonth = participatingHouseholdsLaundry * demand.laundryLoadsPerHouseholdPerWeek * 4.345;

  const participatingHouseholdsCleaning = s.householdCount * s.participation.cleaning;
  const cleaningHours = participatingHouseholdsCleaning * demand.cleaningHoursPerHouseholdPerMonth;

  return {
    sharedMealsPerMonth,
    laundryLoadsPerMonth,
    cleaningHours,
  };
}
