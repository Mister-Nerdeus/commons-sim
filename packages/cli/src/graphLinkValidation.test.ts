import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = repoRoot();
const cliEntry = path.join(root, "packages/cli/dist/main.js");
const rules = "examples/interfaces/compatibility-rules.valid.json";
const templates = [
  "examples/modules/generic/community-meals.template.json",
  "examples/modules/generic/laundry.template.json",
];

test("graph-link-validate returns machine-readable success JSON", () => {
  const result = runGraphLinkValidate("examples/graphs/link-validation.valid.json");

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.issueCount, 0);
  assert.deepEqual(parsed.issues, []);
});

test("graph-link-validate exits nonzero for error-level issues", () => {
  const result = runGraphLinkValidate("examples/graphs/link-validation.invalid-direction.json");

  assert.equal(result.status, 3);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.ok, false);
  assert.equal(parsed.issues.some((issue: { code: string }) => issue.code === "INVALID_DIRECTION_PAIR"), true);
});

test("graph-link-validate keeps adapter-required warnings as zero-exit validation results", () => {
  const result = runGraphLinkValidate("examples/graphs/link-validation.requires-adapter.json");

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.issueCount, 1);
  assert.equal(parsed.issues[0]?.code, "ADAPTER_REQUIRED");
  assert.equal(parsed.issues[0]?.severity, "warning");
});

test("graph-link-validate reports input load failures with a stable error code", () => {
  const result = spawnSync(process.execPath, [cliEntry, "graph-link-validate", "missing.json", rules, ...templates], {
    cwd: root,
    encoding: "utf-8",
  });

  assert.equal(result.status, 3);
  const parsed = JSON.parse(result.stderr);
  assert.equal(parsed.ok, false);
  assert.equal(parsed.error.code, "GRAPH_LINK_VALIDATION_INPUT_ERROR");
});

function runGraphLinkValidate(graph: string) {
  return spawnSync(process.execPath, [cliEntry, "graph-link-validate", graph, rules, ...templates], {
    cwd: root,
    encoding: "utf-8",
  });
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
