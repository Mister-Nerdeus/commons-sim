import type { SimOutputs, TimeSeriesPoint } from "./model.js";

export function computeBurnoutIndex(laborHours: number, householdCount: number): number {
  const sustainableHours = householdCount * 6;
  const overloadBand = householdCount * 12;
  return Math.max(0, Math.min(1, (laborHours - sustainableHours) / Math.max(1, overloadBand)));
}

export function summarizeSeries(series: TimeSeriesPoint[]): SimOutputs["summary"] {
  const horizonMonths = series.length;

  let sumCostPerHH = 0;
  let sumLabor = 0;
  let sumBurnout = 0;

  for (const point of series) {
    sumCostPerHH += point.costPerHouseholdUsd;
    sumLabor += point.laborHours;
    sumBurnout += point.burnoutIndex;
  }

  const reserveEndUsd = horizonMonths > 0 ? series[horizonMonths - 1]!.reserveUsd : 0;

  return {
    avgCostPerHouseholdUsd: horizonMonths > 0 ? sumCostPerHH / horizonMonths : 0,
    avgLaborHoursPerMonth: horizonMonths > 0 ? sumLabor / horizonMonths : 0,
    reserveEndUsd,
    avgBurnoutIndex: horizonMonths > 0 ? sumBurnout / horizonMonths : 0,
  };
}
