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

test("duplicate resource interface ids fail", () => {
  const parsed = ResourceInterfaceRegistrySchema.safeParse(
    loadJson("examples/interfaces/duplicate-resource-interface-id.invalid.json"),
  );
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /duplicate resource interface id/);
});

test("valid compatibility rule fixture validates", () => {
  const parsed = ResourceCompatibilityRuleSetSchema.safeParse(loadJson("examples/interfaces/compatibility-rules.valid.json"));
  assert.equal(parsed.success, true);
});

test("compatible rules allow empty adapter notes", () => {
  const fixture = loadJson("examples/interfaces/compatibility-rules.valid.json") as {
    rules: Array<Record<string, unknown>>;
  };
  fixture.rules[0].adapterNotes = "";
  const parsed = ResourceCompatibilityRuleSetSchema.safeParse(fixture);
  assert.equal(parsed.success, true);
});

test("duplicate compatibility rule ids fail", () => {
  const parsed = ResourceCompatibilityRuleSetSchema.safeParse(
    loadJson("examples/interfaces/duplicate-compatibility-rule-id.invalid.json"),
  );
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /duplicate compatibility rule id/);
});

test("invalid compatibility rule fixture fails", () => {
  const parsed = ResourceCompatibilityRuleSetSchema.safeParse(loadJson("examples/interfaces/compatibility-rules.invalid.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /requiresAdapter|input-only/);
});

test("compatible decisions may not require adapters", () => {
  const parsed = ResourceCompatibilityRuleSetSchema.safeParse(
    loadJson("examples/interfaces/bad-compatible-requires-adapter.invalid.json"),
  );
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /requiresAdapter/);
});

test("adapter-required decisions must include notes", () => {
  const parsed = ResourceCompatibilityRuleSetSchema.safeParse(
    loadJson("examples/interfaces/bad-requires-adapter-no-notes.invalid.json"),
  );
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /adapterNotes/);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
