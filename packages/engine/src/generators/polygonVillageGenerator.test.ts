import test from "node:test";
import assert from "node:assert/strict";
import { ProjectManifestV2Schema } from "@commons-sim/shared";
import { generatePolygonVillage, type PolygonVillageGeneratorInput } from "./polygonVillageGenerator.js";

test("polygon village generator is deterministic for same input", () => {
  const input: PolygonVillageGeneratorInput = {
    generatorVersion: 1,
    preset: "dodecagon-pod",
    seed: 1201,
    designMode: "dream",
    sideCount: 12,
    populationTarget: 120,
    housingUnitTarget: 36,
    diameter: { value: 500, unit: "ft" },
    styleTags: ["pod"],
  };
  const first = generatePolygonVillage(input);
  const second = generatePolygonVillage(input);
  assert.equal(first.outputHash, second.outputHash);
  assert.equal(ProjectManifestV2Schema.safeParse(first.manifest).success, true);
});

test("polygon village generator creates 24-gon Dream Mode saveable output", () => {
  const output = generatePolygonVillage({
    generatorVersion: 1,
    preset: "polygon-garden-village-24gon",
    seed: 1337,
    designMode: "dream",
    sideCount: 24,
    populationTarget: 240,
    housingUnitTarget: 72,
    diameter: { value: 920, unit: "ft" },
    styleTags: ["garden", "24-gon"],
  });
  assert.equal(output.manifest.designMode, "dream");
  assert.equal(output.manifest.validationResults[0]?.canSave, true);
  assert.equal(output.warnings.length, 1);
});
