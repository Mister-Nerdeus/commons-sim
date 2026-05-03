import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VariableRegistrySchema } from "./variableRegistry.js";

const root = repoRoot();

test("valid variable registry fixture validates", () => {
  const parsed = VariableRegistrySchema.safeParse(loadJson("examples/variables/core-human-settlement.variables.json"));
  assert.equal(parsed.success, true);
});

test("invalid variable registry fixture fails", () => {
  const parsed = VariableRegistrySchema.safeParse(loadJson("examples/variables/invalid-variable.examples.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /duplicate variable id|defaultValue|Required/i);
});

test("duplicate variable ids fail", () => {
  const fixture = loadJson("examples/variables/core-human-settlement.variables.json") as any;
  fixture.variables.push({ ...fixture.variables[0] });
  const parsed = VariableRegistrySchema.safeParse(fixture);
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /duplicate variable id/);
});

test("default values outside range fail", () => {
  const fixture = loadJson("examples/variables/core-human-settlement.variables.json") as any;
  fixture.variables[0].defaultValue = 99999;
  const parsed = VariableRegistrySchema.safeParse(fixture);
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /defaultValue is above/);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
