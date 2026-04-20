import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ScenarioSchema } from "./scenarioSchema.js";

function repoRoot(): string {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(thisDir, "../../..");
}

function loadJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

test("baseline and semantic fixtures validate against ScenarioSchema", () => {
  const root = repoRoot();
  const fixtures = [
    path.join(root, "scenarios/baseline-48.json"),
    path.join(root, "scenarios/semantic/reserve-target-low.json"),
    path.join(root, "scenarios/semantic/reserve-target-high.json"),
    path.join(root, "scenarios/semantic/gas-low.json"),
    path.join(root, "scenarios/semantic/gas-high.json"),
  ];

  for (const fixture of fixtures) {
    const parsed = ScenarioSchema.safeParse(loadJson(fixture));
    assert.equal(parsed.success, true, `fixture should validate: ${fixture}`);
  }
});
