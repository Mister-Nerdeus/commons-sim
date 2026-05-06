import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ProjectManifestSchema } from "./projectManifest.js";
import { migrateProjectManifestToV2 } from "./projectMigrations.js";
import { ProjectManifestV2Schema } from "./projectManifestV2.js";

test("ProjectManifest V2 fixtures validate", () => {
  for (const fixturePath of [
    "examples/projects/polygon-garden-village.project-v2.json",
    "examples/projects/dream-incomplete.project-v2.json",
  ]) {
    const fixture = JSON.parse(readFileSync(rootFixturePath(fixturePath), "utf8"));
    assert.equal(ProjectManifestV2Schema.safeParse(fixture).success, true);
  }
});

test("incomplete Dream Mode ProjectManifest V2 is saveable without compiled scenario", () => {
  const fixture = JSON.parse(readFileSync(rootFixturePath("examples/projects/dream-incomplete.project-v2.json"), "utf8"));
  const parsed = ProjectManifestV2Schema.parse(fixture);
  assert.equal(parsed.designMode, "dream");
  assert.equal(parsed.compiledScenario, undefined);
  assert.equal(parsed.validationResults[0]?.canSave, true);
});

test("ProjectManifest V1 migrates to V2 with compiled Scenario V1 intact", () => {
  const v1 = ProjectManifestSchema.parse(JSON.parse(readFileSync(rootFixturePath("examples/projects/baseline.project.json"), "utf8")));
  const migrated = migrateProjectManifestToV2(v1);
  assert.equal(migrated.migratedFrom, 1);
  assert.equal(migrated.manifest.manifestVersion, 2);
  assert.deepEqual(migrated.manifest.compiledScenario, v1.scenario);
});

function rootFixturePath(path: string) {
  return resolve(process.cwd(), "../..", path);
}
