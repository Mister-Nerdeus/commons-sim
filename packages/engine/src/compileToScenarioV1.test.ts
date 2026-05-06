import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ProjectManifestV2Schema } from "@commons-sim/shared";
import { compileToScenarioV1 } from "./compileToScenarioV1.js";

test("supported ProjectManifestV2 compiles from attached Scenario V1", () => {
  const fixture = ProjectManifestV2Schema.parse(
    JSON.parse(readFileSync(rootFixturePath("examples/projects/compile-supported.project-v2.json"), "utf8")),
  );
  const result = compileToScenarioV1(fixture);
  assert.equal(result.ok, true);
  assert.equal(result.scenario?.id, "compile-supported-scenario");
  assert.equal(result.errors.length, 0);
});

test("unsupported Dream Mode project returns warnings without crash", () => {
  const fixture = ProjectManifestV2Schema.parse(
    JSON.parse(readFileSync(rootFixturePath("examples/projects/compile-unsupported-dream.project-v2.json"), "utf8")),
  );
  const result = compileToScenarioV1(fixture);
  assert.equal(result.ok, false);
  assert.equal(result.warnings.length > 0, true);
  assert.equal(result.errors.length, 0);
});

test("unsupported Challenge Mode project blocks", () => {
  const fixture = ProjectManifestV2Schema.parse(
    JSON.parse(readFileSync(rootFixturePath("examples/projects/compile-unsupported-dream.project-v2.json"), "utf8")),
  );
  const result = compileToScenarioV1({ ...fixture, designMode: "challenge" });
  assert.equal(result.ok, false);
  assert.equal(result.errors.some((issue) => issue.severity === "blocking"), true);
});

function rootFixturePath(path: string) {
  return resolve(process.cwd(), "../..", path);
}
