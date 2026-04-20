export type SummaryMetrics = {
  avgCostPerHouseholdUsd: number;
  avgLaborHoursPerMonth: number;
  reserveEndUsd: number;
  avgBurnoutIndex: number;
};

export function explainSummaryDeltas(base: SummaryMetrics, candidate: SummaryMetrics): string[] {
  const lines: string[] = [];
  const costDelta = candidate.avgCostPerHouseholdUsd - base.avgCostPerHouseholdUsd;
  const laborDelta = candidate.avgLaborHoursPerMonth - base.avgLaborHoursPerMonth;
  const reserveDelta = candidate.reserveEndUsd - base.reserveEndUsd;
  const burnoutDelta = candidate.avgBurnoutIndex - base.avgBurnoutIndex;

  lines.push(describe("Avg cost/household", costDelta, "usd"));
  lines.push(describe("Avg labor/month", laborDelta, "hours"));
  lines.push(describe("Reserve end", reserveDelta, "usd"));
  lines.push(describe("Avg burnout", burnoutDelta, "index"));

  return lines;
}

function describe(label: string, value: number, type: "usd" | "hours" | "index") {
  const direction = value > 0 ? "increased" : value < 0 ? "decreased" : "did not change";
  if (type === "usd") return `${label} ${direction} by ${formatUsd(value)}.`;
  if (type === "hours") return `${label} ${direction} by ${formatHours(value)}.`;
  return `${label} ${direction} by ${value.toFixed(3)}.`;
}

function formatUsd(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}$${value.toFixed(2)}`;
}

function formatHours(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}h`;
}
