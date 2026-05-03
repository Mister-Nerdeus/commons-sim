import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ModuleTerminalSchema } from "./moduleTerminals.js";

const root = repoRoot();

test("valid terminal fixtures validate", () => {
  const terminals = loadJson("examples/modules/community-meals/terminals.valid.json") as unknown[];
  for (const terminal of terminals) {
    assert.equal(ModuleTerminalSchema.safeParse(terminal).success, true);
  }
});

test("invalid terminal fixtures fail", () => {
  const terminals = loadJson("examples/modules/community-meals/terminals.invalid.json") as unknown[];
  for (const terminal of terminals) {
    assert.equal(ModuleTerminalSchema.safeParse(terminal).success, false);
  }
});

test("legacy hyphen-only terminal ids fail", () => {
  const parsed = ModuleTerminalSchema.safeParse({
    id: "food-input",
    resourceType: "food",
    unit: "kg/day",
    timingModel: "daily",
    nominalCapacity: 1,
    peakCapacity: 1,
    qualityAttributes: [],
    direction: "input",
    allocationMode: "fixed",
    spatialScope: "site",
    criticality: "low",
    failureSemantics: {
      behavior: "degrade",
      description: "Invalid legacy id example.",
    },
  });
  assert.equal(parsed.success, false);
});

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
