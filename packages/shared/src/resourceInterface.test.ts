import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ResourceCompatibilityRuleSetSchema,
  ResourceInterfaceRegistrySchema,
} from "./resourceInterface.js";

const root = repoRoot();

test("valid resource interface fixture validates", () => {
  const parsed = ResourceInterfaceRegistrySchema.safeParse(loadJson("examples/interfaces/resource-interfaces.valid.json"));
  assert.equal(parsed.success, true);
});

test("invalid resource interface fixture fails", () => {
  const parsed = ResourceInterfaceRegistrySchema.safeParse(loadJson("examples/interfaces/resource-interfaces.invalid.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /duplicate resource interface id|unit id/);
});

test("valid compatibility rule fixture validates", () => {
  const parsed = ResourceCompatibilityRuleSetSchema.safeParse(loadJson("examples/interfaces/compatibility-rules.valid.json"));
  assert.equal(parsed.success, true);
});

test("compatible rules may omit adapter notes", () => {
  const fixture = loadJson("examples/interfaces/compatibility-rules.valid.json") as {
    rules: Array<Record<string, unknown>>;
  };
  fixture.rules[0].adapterNotes = "";
  const parsed = ResourceCompatibilityRuleSetSchema.safeParse(fixture);
  assert.equal(parsed.success, true);
});

test("invalid compatibility rule fixture fails", () => {
  const parsed = ResourceCompatibilityRuleSetSchema.safeParse(loadJson("examples/interfaces/compatibility-rules.invalid.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /requiresAdapter|input-only/);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
