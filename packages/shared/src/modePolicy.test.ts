import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateModeValidation, ModeValidationIssueSchema } from "./modeValidation.js";
import { getDefaultModePolicy, ModePolicySchema, type DesignMode } from "./modePolicy.js";

const modes: DesignMode[] = ["dream", "soft-sim", "challenge", "professional", "research"];

test("default mode policies validate for all design modes", () => {
  for (const mode of modes) {
    assert.equal(ModePolicySchema.safeParse(getDefaultModePolicy(mode)).success, true);
  }
});

test("mode policy fixtures validate", () => {
  for (const mode of modes) {
    const fixture = JSON.parse(readFileSync(fixturePath(`examples/modes/${mode}.mode.json`), "utf8"));
    assert.equal(ModePolicySchema.safeParse(fixture).success, true);
  }
});

function fixturePath(path: string) {
  return resolve(process.cwd(), "../..", path);
}

test("Dream Mode warnings do not block save", () => {
  const policy = getDefaultModePolicy("dream");
  const warning = ModeValidationIssueSchema.parse({
    code: "incomplete-layout",
    severity: "warning",
    path: "designDocument.layoutGraphRef",
    message: "Layout is still incomplete.",
    mode: "dream",
    canUserOverride: true,
  });
  const result = evaluateModeValidation(policy, [warning]);
  assert.equal(result.canSave, true);
  assert.equal(result.ok, true);
});

test("Challenge and Professional modes can block strict violations", () => {
  const challenge = evaluateModeValidation(getDefaultModePolicy("challenge"), [
    {
      code: "locked-field-changed",
      severity: "blocking",
      path: "compiledScenario.householdCount",
      message: "Locked benchmark field changed.",
      mode: "challenge",
      canUserOverride: false,
    },
  ]);
  const professional = evaluateModeValidation(getDefaultModePolicy("professional"), [
    {
      code: "missing-provenance",
      severity: "blocking",
      path: "metadata.author",
      message: "Professional mode requires provenance.",
      mode: "professional",
      canUserOverride: false,
    },
  ]);

  assert.equal(challenge.canSubmitToLeaderboard, false);
  assert.equal(professional.canExportProfessionalReport, false);
});
