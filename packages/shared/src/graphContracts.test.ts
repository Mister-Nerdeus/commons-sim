import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ProblemGraphSchema, SolutionGraphSchema, WorldGraphSchema } from "./graphContracts.js";

const root = repoRoot();

test("valid graph fixtures validate", () => {
  assert.equal(ProblemGraphSchema.safeParse(loadJson("examples/graphs/community-services.problem-graph.json")).success, true);
  assert.equal(SolutionGraphSchema.safeParse(loadJson("examples/graphs/community-services.solution-graph.json")).success, true);
  assert.equal(WorldGraphSchema.safeParse(loadJson("examples/graphs/community-services.world-graph.json")).success, true);
});

test("invalid link fixture fails", () => {
  const parsed = SolutionGraphSchema.safeParse(loadJson("examples/graphs/invalid-link.invalid.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /toNodeId/);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
