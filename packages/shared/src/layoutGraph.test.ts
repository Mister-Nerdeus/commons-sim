import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LayoutGraphSchema } from "./layoutGraph.js";

test("LayoutGraph fixtures validate for dodecagon, 24-gon, and incomplete Dream Mode", () => {
  for (const fixturePath of [
    "examples/layouts/dodecagon-pod.layout.json",
    "examples/layouts/polygon-garden-village-24gon.layout.json",
    "examples/layouts/incomplete-dream.layout.json",
  ]) {
    const fixture = JSON.parse(readFileSync(rootFixturePath(fixturePath), "utf8"));
    assert.equal(LayoutGraphSchema.safeParse(fixture).success, true, fixturePath);
  }
});

test("invalid polygon fixture fails deterministically", () => {
  const fixture = JSON.parse(readFileSync(rootFixturePath("examples/layouts/invalid-polygon.layout.json"), "utf8"));
  const first = LayoutGraphSchema.safeParse(fixture);
  const second = LayoutGraphSchema.safeParse(fixture);
  assert.equal(first.success, false);
  assert.equal(second.success, false);
  if (!first.success && !second.success) {
    assert.deepEqual(first.error.issues, second.error.issues);
  }
});

function rootFixturePath(path: string) {
  return resolve(process.cwd(), "../..", path);
}
