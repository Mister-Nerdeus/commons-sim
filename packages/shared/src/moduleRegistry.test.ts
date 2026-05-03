import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ModuleRegistrySchema } from "./moduleRegistry.js";

const root = repoRoot();

test("valid module registry fixture validates", () => {
  const parsed = ModuleRegistrySchema.safeParse(loadJson("examples/modules/registry.valid.json"));
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.modules.length, 3);
});

test("invalid module registry fixture fails", () => {
  const parsed = ModuleRegistrySchema.safeParse(loadJson("examples/modules/registry.invalid.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /duplicate module id|Invalid enum value|Required/i);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
