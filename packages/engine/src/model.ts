import type { Scenario } from "@commons-sim/shared";

export type TimeSeriesPoint = {
  monthIndex: number;
  totalOpexUsd: number;
  laborHours: number;
  reserveUsd: number;
  costPerHouseholdUsd: number;
  burnoutIndex: number; // 0..1 proxy (Phase 1)
};

export type SimOutputs = {
  scenarioId: string;
  horizonMonths: number;

  summary: {
    avgCostPerHouseholdUsd: number;
    avgLaborHoursPerMonth: number;
    reserveEndUsd: number;
    avgBurnoutIndex: number;
  };

  series: TimeSeriesPoint[];

  // For determinism gates: stable hash input (JSON string) should match snapshot.
  meta: {
    modelVersion: string;
    assumptionSetVersion: string;
    engineVersion: string;
    seed: number;
  };
};

export type EngineOptions = {
  engineVersion?: string;
  modelVersion?: string;
  assumptionSetVersion?: string;
};

export function deriveResidentCount(s: Scenario) {
  const { singles, couples, families } = s.householdMix;
  return (
    singles * s.occupantsPerType.single +
    couples * s.occupantsPerType.couple +
    families * s.occupantsPerType.family
  );
}
