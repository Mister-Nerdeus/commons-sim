import type { Scenario } from "@commons-sim/shared";

export type ReserveUpdate = {
  reserveUsd: number;
  targetReserveUsd: number;
  contributionUsd: number;
};

export function monthlyEquipmentCostUsd(s: Scenario): number {
  const annual = s.equipment.reduce((acc, e) => {
    const annualDep = e.usefulLifeYears > 0 ? e.capexUsd / e.usefulLifeYears : 0;
    return acc + annualDep + e.annualMaintenanceUsd;
  }, 0);
  return annual / 12;
}

export function applyReservePolicy(s: Scenario, currentReserveUsd: number, totalOpexUsd: number): ReserveUpdate {
  const targetReserveUsd = totalOpexUsd * s.reservePolicy.targetMonthsOfOpex;
  const gapToTargetUsd = Math.max(0, targetReserveUsd - currentReserveUsd);
  const contributionUsd = Math.min(
    gapToTargetUsd,
    totalOpexUsd * 0.05,
    s.reservePolicy.maxReserveUsd - currentReserveUsd,
  );
  const reserveUsd = Math.min(s.reservePolicy.maxReserveUsd, currentReserveUsd + Math.max(0, contributionUsd));

  return {
    reserveUsd,
    targetReserveUsd,
    contributionUsd,
  };
}
