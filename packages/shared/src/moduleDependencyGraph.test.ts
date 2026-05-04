import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ModuleDependencyGraphSchema } from "./moduleDependencyGraph.js";

const root = repoRoot();

test("valid module dependency graph fixture validates", () => {
  const parsed = ModuleDependencyGraphSchema.safeParse(loadJson("examples/dependencies/module-dependency-graph.valid.json"));
  assert.equal(parsed.success, true);
});

test("invalid module dependency graph fixture fails", () => {
  const parsed = ModuleDependencyGraphSchema.safeParse(loadJson("examples/dependencies/module-dependency-graph.invalid.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /duplicate dependency node id|toNodeId/);
});

test("unresolved required dependency fixture fails", () => {
  const parsed = ModuleDependencyGraphSchema.safeParse(loadJson("examples/dependencies/unresolved-required-dependency.invalid.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /required dependency edge/);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
