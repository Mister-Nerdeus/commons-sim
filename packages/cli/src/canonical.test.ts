import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

function repoRoot() {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(thisDir, "../../..");
}

test("canonical scenarios validate through CLI", () => {
  const root = repoRoot();
  const cliEntry = path.join(root, "packages/cli/dist/main.js");
  const canonicalDir = path.join(root, "examples/scenarios/canonical");
  const scenarios = readdirSync(canonicalDir).filter((f) => f.endsWith(".json")).sort();

  assert.ok(scenarios.length >= 3, "expected canonical scenario set");

  for (const file of scenarios) {
    const scenarioPath = path.join(canonicalDir, file);
    const result = spawnSync(process.execPath, [cliEntry, "validate", scenarioPath], {
      cwd: root,
      encoding: "utf-8",
    });

    assert.equal(result.status, 0, `${file} did not validate`);
    assert.match(result.stdout, /"ok": true/);
  }
});
