import test from "node:test";
import assert from "node:assert/strict";
import { buildStarterScenario } from "./planningWizard.js";

test("wizard templates generate valid scenarios", () => {
  const ids = ["starter-balanced-24", "starter-family-48", "starter-lean-18"] as const;
  for (const id of ids) {
    const scenario = buildStarterScenario(id);
    assert.equal(scenario.version, 1);
    assert.ok(scenario.householdCount > 0);
  }
});
