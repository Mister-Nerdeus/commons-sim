import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

function repoRoot() {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(thisDir, "../../..");
}

test("cli run command succeeds for baseline fixture", () => {
  const root = repoRoot();
  const cliEntry = path.join(root, "packages/cli/dist/main.js");
  const scenario = path.join(root, "scenarios/baseline-48.json");

  const result = spawnSync(process.execPath, [cliEntry, "run", scenario], {
    cwd: root,
    encoding: "utf-8",
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /"scenarioId": "baseline-48"/);
});

test("cli run command fails for missing scenario", () => {
  const root = repoRoot();
  const cliEntry = path.join(root, "packages/cli/dist/main.js");

  const result = spawnSync(process.execPath, [cliEntry, "run", "scenarios/does-not-exist.json"], {
    cwd: root,
    encoding: "utf-8",
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /SCENARIO_NOT_FOUND|Scenario file not found/i);
});

test("cli validate command succeeds for baseline fixture", () => {
  const root = repoRoot();
  const cliEntry = path.join(root, "packages/cli/dist/main.js");
  const scenario = path.join(root, "scenarios/baseline-48.json");

  const result = spawnSync(process.execPath, [cliEntry, "validate", scenario], {
    cwd: root,
    encoding: "utf-8",
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /\"ok\": true/);
  assert.match(result.stdout, /\"scenarioId\": \"baseline-48\"/);
});

test("cli sensitivity command succeeds for baseline fixture", () => {
  const root = repoRoot();
  const cliEntry = path.join(root, "packages/cli/dist/main.js");
  const scenario = path.join(root, "scenarios/baseline-48.json");

  const result = spawnSync(process.execPath, [cliEntry, "sensitivity", scenario], {
    cwd: root,
    encoding: "utf-8",
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /"scenarioId": "baseline-48"/);
  assert.match(result.stdout, /"runs": \[/);
});

test("cli project-save and project-load round-trip succeeds", () => {
  const root = repoRoot();
  const cliEntry = path.join(root, "packages/cli/dist/main.js");
  const scenario = path.join(root, "scenarios/baseline-48.json");
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "commons-sim-"));
  const manifest = path.join(tempDir, "baseline.project.json");

  const save = spawnSync(process.execPath, [cliEntry, "project-save", scenario, manifest], {
    cwd: root,
    encoding: "utf-8",
  });
  assert.equal(save.status, 0);
  assert.match(save.stdout, /"ok": true/);

  const load = spawnSync(process.execPath, [cliEntry, "project-load", manifest], {
    cwd: root,
    encoding: "utf-8",
  });
  assert.equal(load.status, 0);
  assert.match(load.stdout, /"scenarioId": "baseline-48"/);
});
