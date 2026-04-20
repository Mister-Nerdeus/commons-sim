import test from "node:test";
import assert from "node:assert/strict";
import { explainSummaryDeltas } from "./explainability.js";

test("explainSummaryDeltas reflects metric deltas", () => {
  const lines = explainSummaryDeltas(
    {
      avgCostPerHouseholdUsd: 100,
      avgLaborHoursPerMonth: 50,
      reserveEndUsd: 2000,
      avgBurnoutIndex: 0.2,
    },
    {
      avgCostPerHouseholdUsd: 110,
      avgLaborHoursPerMonth: 45,
      reserveEndUsd: 2500,
      avgBurnoutIndex: 0.25,
    },
  );

  assert.equal(lines.length, 4);
  assert.match(lines[0], /increased/);
  assert.match(lines[1], /decreased/);
});
