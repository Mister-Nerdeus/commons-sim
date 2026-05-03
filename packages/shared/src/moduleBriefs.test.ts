import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ModuleProblemBriefSchema, ModuleSolutionBriefSchema } from "./moduleBriefs.js";

const root = repoRoot();

test("community meals problem and solution briefs validate", () => {
  assert.equal(ModuleProblemBriefSchema.safeParse(loadJson("examples/modules/community-meals/problem-brief.json")).success, true);
  assert.equal(ModuleSolutionBriefSchema.safeParse(loadJson("examples/modules/community-meals/solution-brief.generic.json")).success, true);
});

test("empty problem brief fails", () => {
  const parsed = ModuleProblemBriefSchema.safeParse({ problemStatement: "", stakeholders: [] });
  assert.equal(parsed.success, false);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
