import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { simulateScenario } from "./simulate.js";
import { demandModelFromScenario } from "./tiers.js";

function stableStringify(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, val) => {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        return Object.keys(val as Record<string, unknown>)
          .sort()
          .reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = (val as Record<string, unknown>)[key];
            return acc;
          }, {});
      }
      return val;
    },
    2,
  );
}

test("tier mapping returns expected demand coefficients", () => {
  const scenario: any = {
    serviceTiers: { meals: 2, laundry: 1, cleaning: 3 },
  };

  const demand = demandModelFromScenario(scenario);
  assert.deepEqual(demand, {
    mealsPerResidentPerDay: 1.2,
    laundryLoadsPerHouseholdPerWeek: 1,
    cleaningHoursPerHouseholdPerMonth: 2.5,
  });
});

test("baseline scenario output parity hash remains unchanged", () => {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(thisDir, "../../..");
  const scenarioPath = path.join(repoRoot, "scenarios/baseline-48.json");

  const scenario = JSON.parse(fs.readFileSync(scenarioPath, "utf-8"));
  const output = simulateScenario(scenario);

  const hash = createHash("sha256").update(stableStringify(output)).digest("hex");
  assert.equal(hash, "8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e");
});
