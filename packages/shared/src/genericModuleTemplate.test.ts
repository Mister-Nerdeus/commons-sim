import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GenericModuleTemplateSchema } from "./genericModuleTemplate.js";

const root = repoRoot();

test("valid generic module templates validate", () => {
  const fixtures = [
    "examples/modules/generic/community-meals.template.json",
    "examples/modules/generic/laundry.template.json",
  ];

  for (const fixture of fixtures) {
    assert.equal(GenericModuleTemplateSchema.safeParse(loadJson(fixture)).success, true);
  }
});

test("product-specific generic module template fixture fails", () => {
  const parsed = GenericModuleTemplateSchema.safeParse(loadJson("examples/modules/generic/invalid-product-specific.template.json"));
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /manufacturer|Unrecognized key/);
});

test("generic module template rejects output-only required inputs", () => {
  const template = loadJson("examples/modules/generic/community-meals.template.json") as Record<string, unknown>;
  const requiredInputs = template.requiredInputs as Array<Record<string, unknown>>;
  requiredInputs[0] = { ...requiredInputs[0], direction: "output" };

  const parsed = GenericModuleTemplateSchema.safeParse(template);
  assert.equal(parsed.success, false);
  assert.match(parsed.error.message, /requiredInputs/);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
