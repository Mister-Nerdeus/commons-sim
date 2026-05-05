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

test("duplicate dependency node ids fail", () => {
  const parsed = ModuleDependencyGraphSchema.safeParse(
    loadJson("examples/dependencies/duplicate-dependency-node-id.invalid.json"),
  );
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /duplicate dependency node id/);
});

test("duplicate dependency edge ids fail", () => {
  const parsed = ModuleDependencyGraphSchema.safeParse(
    loadJson("examples/dependencies/duplicate-dependency-edge-id.invalid.json"),
  );
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /duplicate dependency edge id/);
});

test("missing node references fail", () => {
  const parsed = ModuleDependencyGraphSchema.safeParse(
    loadJson("examples/dependencies/missing-node-reference.invalid.json"),
  );
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /toNodeId/);
});

test("unresolved required dependency fixture fails", () => {
  const parsed = ModuleDependencyGraphSchema.safeParse(loadJson("examples/dependencies/unresolved-required-dependency.invalid.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /required dependency/);
});

test("unresolved optional dependency fixture passes", () => {
  const parsed = ModuleDependencyGraphSchema.safeParse(
    loadJson("examples/dependencies/unresolved-optional-dependency.valid.json"),
  );
  assert.equal(parsed.success, true);
});

test("external dependencies require sourceRef", () => {
  const parsed = ModuleDependencyGraphSchema.safeParse(
    loadJson("examples/dependencies/external-missing-source-ref.invalid.json"),
  );
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /sourceRef/);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
