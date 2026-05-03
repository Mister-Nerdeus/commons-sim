import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AiArtifactTagSchema, UnitIdSchema } from "./semanticPrimitives.js";

const root = repoRoot();

test("semantic primitive fixture validates", () => {
  const parsed = AiArtifactTagSchema.safeParse(loadJson("examples/semantic-primitives/example-valid.json"));
  assert.equal(parsed.success, true);
});

test("invalid semantic primitive fixture fails", () => {
  const parsed = AiArtifactTagSchema.safeParse(loadJson("examples/semantic-primitives/example-invalid.json"));
  assert.equal(parsed.success, false);
});

test("unit ids are explicit lowercase contracts", () => {
  assert.equal(UnitIdSchema.safeParse("kwh/month").success, true);
  assert.equal(UnitIdSchema.safeParse("KWH").success, false);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
