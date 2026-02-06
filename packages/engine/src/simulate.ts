import type { Scenario } from "@commons-sim/shared";
import { mulberry32 } from "./rng";
import { deriveResidentCount, type EngineOptions, type SimOutputs, type DemandModel } from "./model";

/**
 * Phase 1 modeling philosophy:
 * - Keep equations inspectable.
 * - Prefer conservative staffing and maintenance assumptions.
 * - Track: opex, labor, reserves, utilization proxies, burnout proxy.
 *
 * This is a planning engine: credibility > complexity.
 */
export function simulateScenario(s: Scenario, opts: EngineOptions = {}): SimOutputs {
  const engineVersion = opts.engineVersion ?? "0.1.0";
  const rng = mulberry32(s.seed);

  const residents = deriveResidentCount(s);

  // Demand model: simple tier-based defaults (Phase 1)
  const demand: DemandModel = {
    mealsPerResidentPerDay:
      s.serviceTiers.meals === 0 ? 0 : s.serviceTiers.meals === 1 ? 0.6 : s.serviceTiers.meals === 2 ? 1.2 : 1.6,
    laundryLoadsPerHouseholdPerWeek:
      s.serviceTiers.laundry === 0 ? 0 : s.serviceTiers.laundry === 1 ? 1.0 : s.serviceTiers.laundry === 2 ? 1.6 : 2.2,
    cleaningHoursPerHouseholdPerMonth:
      s.serviceTiers.cleaning === 0 ? 0 : s.serviceTiers.cleaning === 1 ? 0.75 : s.serviceTiers.cleaning === 2 ? 1.5 : 2.5,
  };

  // Participation reduces *shared* demand (households opting out do self-service)
  const mealsParticipation = s.participation.meals;
  const laundryParticipation = s.participation.laundry;
  const cleaningParticipation = s.participation.cleaning;

  const equipmentAnnual = s.equipment.reduce((acc, e) => {
    const annualDep = e.usefulLifeYears > 0 ? e.capexUsd / e.usefulLifeYears : 0;
    return acc + annualDep + e.annualMaintenanceUsd;
  }, 0);

  const equipmentMonthly = equipmentAnnual / 12;

  // Reserve state
  let reserve = s.reservePolicy.initialReserveUsd;

  const series = [];
  let sumCostPerHH = 0;
  let sumLabor = 0;
  let sumBurnout = 0;

  for (let m = 0; m < s.horizonMonths; m++) {
    // Random shocks (Phase 1 “light”): mild staffing inefficiency drift, deterministic via RNG
    const ineff = 1 + (rng() - 0.5) * 0.06; // ±3%
    const overhead = s.wageModel.overheadMultiplier;

    // Meals
    const sharedMealsPerDay = residents * demand.mealsPerResidentPerDay * mealsParticipation;
    const sharedMealsPerMonth = sharedMealsPerDay * 30;

    // Laundry
    const participatingHouseholdsLaundry = s.householdCount * laundryParticipation;
    const laundryLoadsPerMonth = participatingHouseholdsLaundry * demand.laundryLoadsPerHouseholdPerWeek * 4.345;

    // Cleaning
    const participatingHouseholdsCleaning = s.householdCount * cleaningParticipation;
    const cleaningHours = participatingHouseholdsCleaning * demand.cleaningHoursPerHouseholdPerMonth;

    // Labor models (very transparent Phase 1 constants)
    const mealLaborHours = (sharedMealsPerMonth / 120) * 8; // 120 meals per “batch-day” * 8 hrs
    const laundryLaborHours = laundryLoadsPerMonth * 0.15; // 9 min/load equivalent (handling + ops)
    const cleaningLaborHours = cleaningHours; // direct hours

    const laborHoursRaw = (mealLaborHours + laundryLaborHours + cleaningLaborHours) * ineff;
    const laborHours = laborHoursRaw * overhead;

    const laborCost = laborHours * s.wageModel.fullyLoadedUsdPerHour;

    // Utilities: coarse planning proxy (Phase 1)
    const electricityKwh =
      (sharedMealsPerMonth * 0.4 + laundryLoadsPerMonth * 0.7 + s.householdCount * 12) * 0.15; // conservative proxy
    const waterGal = laundryLoadsPerMonth * 22 + sharedMealsPerMonth * 0.6 + s.householdCount * 900; // includes baseline living
    const sewerGal = waterGal;

    const utilityCost =
      electricityKwh * s.utilities.electricity_kwh +
      waterGal * s.utilities.water_gal +
      sewerGal * s.utilities.sewer_gal;

    const totalOpexUsd = laborCost + utilityCost + equipmentMonthly;

    // Reserve policy: keep a target reserve buffer; anything above target is “returned” (Phase 1)
    const targetReserve = totalOpexUsd * s.reservePolicy.targetMonthsOfOpex;
    void targetReserve;
    const contribution = Math.min(totalOpexUsd * 0.05, s.reservePolicy.maxReserveUsd - reserve); // 5% into reserve until cap
    reserve = Math.min(s.reservePolicy.maxReserveUsd, reserve + Math.max(0, contribution));

    const costPerHouseholdUsd = totalOpexUsd / s.householdCount;

    // Burnout proxy: placeholder metric (Phase 1)
    const fte = laborHours / 160;
    const burnoutIndex = Math.max(0, Math.min(1, laborHours / Math.max(1, fte * 160) - 1));

    const point = {
      monthIndex: m,
      totalOpexUsd,
      laborHours,
      reserveUsd: reserve,
      costPerHouseholdUsd,
      burnoutIndex,
    };

    series.push(point);
    sumCostPerHH += costPerHouseholdUsd;
    sumLabor += laborHours;
    sumBurnout += burnoutIndex;
  }

  return {
    scenarioId: s.id,
    horizonMonths: s.horizonMonths,
    summary: {
      avgCostPerHouseholdUsd: sumCostPerHH / s.horizonMonths,
      avgLaborHoursPerMonth: sumLabor / s.horizonMonths,
      reserveEndUsd: reserve,
      avgBurnoutIndex: sumBurnout / s.horizonMonths,
    },
    series,
    meta: { engineVersion, seed: s.seed },
  };
}
