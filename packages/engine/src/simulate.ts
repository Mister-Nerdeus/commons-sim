import type { Scenario } from "@commons-sim/shared";
import { mulberry32 } from "./rng.js";
import { deriveResidentCount, type EngineOptions, type SimOutputs, type TimeSeriesPoint } from "./model.js";
import { demandModelFromScenario } from "./tiers.js";
import { computeMonthlyDemand } from "./demand.js";
import { computeLabor } from "./labor.js";
import { computeUtilities } from "./utilities.js";
import { applyReservePolicy, monthlyEquipmentCostUsd } from "./reserve.js";
import { computeBurnoutIndex, summarizeSeries } from "./metrics.js";

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
  const modelVersion = opts.modelVersion ?? "1.1.0";
  const assumptionSetVersion = opts.assumptionSetVersion ?? "phase1-2026-04-19";
  const rng = mulberry32(s.seed);
  const residents = deriveResidentCount(s);
  const demand = demandModelFromScenario(s);
  const equipmentMonthly = monthlyEquipmentCostUsd(s);

  // Reserve state
  let reserve = s.reservePolicy.initialReserveUsd;

  const series: TimeSeriesPoint[] = [];

  for (let m = 0; m < s.horizonMonths; m++) {
    const inefficiency = 1 + (rng() - 0.5) * 0.06;
    const monthlyDemand = computeMonthlyDemand(s, residents, demand);
    const labor = computeLabor(s, {
      sharedMealsPerMonth: monthlyDemand.sharedMealsPerMonth,
      laundryLoadsPerMonth: monthlyDemand.laundryLoadsPerMonth,
      cleaningHours: monthlyDemand.cleaningHours,
      inefficiency,
    });
    const utilities = computeUtilities(s, monthlyDemand.sharedMealsPerMonth, monthlyDemand.laundryLoadsPerMonth);

    const totalOpexUsd = labor.laborCost + utilities.utilityCost + equipmentMonthly;
    const reserveUpdate = applyReservePolicy(s, reserve, totalOpexUsd);
    reserve = reserveUpdate.reserveUsd;
    void reserveUpdate.targetReserveUsd;

    const costPerHouseholdUsd = totalOpexUsd / s.householdCount;
    const burnoutIndex = computeBurnoutIndex(labor.laborHours, s.householdCount);

    const point = {
      monthIndex: m,
      totalOpexUsd,
      laborHours: labor.laborHours,
      reserveUsd: reserve,
      costPerHouseholdUsd,
      burnoutIndex,
    };

    series.push(point);
  }

  return {
    scenarioId: s.id,
    horizonMonths: s.horizonMonths,
    summary: summarizeSeries(series),
    series,
    meta: { modelVersion, assumptionSetVersion, engineVersion, seed: s.seed },
  };
}
