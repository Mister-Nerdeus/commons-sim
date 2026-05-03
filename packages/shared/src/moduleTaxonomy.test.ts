import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ModuleIdentitySchema, ModuleLifecycleStageSchema, ModuleRoleSchema } from "./moduleTaxonomy.js";

const root = repoRoot();

test("module role and lifecycle enums include required GOSP values", () => {
  assert.equal(ModuleRoleSchema.safeParse("Transform").success, true);
  assert.equal(ModuleRoleSchema.safeParse("Demand").success, true);
  assert.equal(ModuleLifecycleStageSchema.safeParse("Class").success, true);
  assert.equal(ModuleLifecycleStageSchema.safeParse("Generic Template").success, true);
  assert.equal(ModuleLifecycleStageSchema.safeParse("Real-World Binding").success, true);
  assert.equal(ModuleLifecycleStageSchema.safeParse("Scenario Instance").success, true);
});

test("valid taxonomy fixture validates", () => {
  assert.equal(ModuleIdentitySchema.safeParse(loadJson("examples/modules/taxonomy.valid.json")).success, true);
});

test("invalid taxonomy fixture fails", () => {
  assert.equal(ModuleIdentitySchema.safeParse(loadJson("examples/modules/taxonomy.invalid.json")).success, false);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
