import type { Scenario } from "@commons-sim/shared";

export type ServiceTier = 0 | 1 | 2 | 3;

export type TierDemand = {
  mealsPerResidentPerDay: number;
  laundryLoadsPerHouseholdPerWeek: number;
  cleaningHoursPerHouseholdPerMonth: number;
};

function asTier(value: number): ServiceTier {
  if (value === 0 || value === 1 || value === 2 || value === 3) {
    return value;
  }
  throw new Error(`Unsupported service tier: ${value}`);
}

export function demandModelFromScenario(s: Scenario): TierDemand {
  const meals = asTier(s.serviceTiers.meals);
  const laundry = asTier(s.serviceTiers.laundry);
  const cleaning = asTier(s.serviceTiers.cleaning);

  return {
    mealsPerResidentPerDay: meals === 0 ? 0 : meals === 1 ? 0.6 : meals === 2 ? 1.2 : 1.6,
    laundryLoadsPerHouseholdPerWeek: laundry === 0 ? 0 : laundry === 1 ? 1.0 : laundry === 2 ? 1.6 : 2.2,
    cleaningHoursPerHouseholdPerMonth: cleaning === 0 ? 0 : cleaning === 1 ? 0.75 : cleaning === 2 ? 1.5 : 2.5,
  };
}
