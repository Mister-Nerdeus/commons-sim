import {
  DesignModeSchema,
  ModeValidationIssueSchema,
  ProjectManifestV2Schema,
  ScenarioSchema,
  type DesignMode,
  type ModeValidationIssue,
  type ProjectManifestV2,
  type Scenario,
} from "@commons-sim/shared";
import { z } from "zod";

const UnsupportedFeatureSchema = z.object({
  path: z.string().min(1),
  reason: z.string().min(1),
  severity: z.enum(["warning", "error", "blocking"]),
});

export const CompileToScenarioV1ResultSchema = z.object({
  ok: z.boolean(),
  mode: DesignModeSchema,
  scenario: ScenarioSchema.optional(),
  warnings: z.array(ModeValidationIssueSchema),
  errors: z.array(ModeValidationIssueSchema),
  unsupportedFeatures: z.array(UnsupportedFeatureSchema),
  inputHash: z.string().min(1),
  outputHash: z.string().min(1).optional(),
});
export type CompileToScenarioV1Result = z.infer<typeof CompileToScenarioV1ResultSchema>;

export function compileToScenarioV1(input: ProjectManifestV2): CompileToScenarioV1Result {
  const manifest = ProjectManifestV2Schema.parse(input);
  const unsupported = findUnsupportedFeatures(manifest);
  const blockingUnsupported = unsupported.filter((feature) => feature.severity !== "warning");
  const warnings = unsupported
    .filter((feature) => feature.severity === "warning")
    .map((feature) => issueFromUnsupported(manifest.designMode, feature.path, feature.reason, "warning"));
  const errors = blockingUnsupported.map((feature) =>
    issueFromUnsupported(manifest.designMode, feature.path, feature.reason, feature.severity === "blocking" ? "blocking" : "error"),
  );

  if (!manifest.compiledScenario || errors.length > 0) {
    return CompileToScenarioV1ResultSchema.parse({
      ok: false,
      mode: manifest.designMode,
      warnings,
      errors,
      unsupportedFeatures: unsupported,
      inputHash: hashJson(manifest),
    });
  }

  const scenario: Scenario = ScenarioSchema.parse(manifest.compiledScenario);
  return CompileToScenarioV1ResultSchema.parse({
    ok: true,
    mode: manifest.designMode,
    scenario,
    warnings,
    errors,
    unsupportedFeatures: unsupported,
    inputHash: hashJson(manifest),
    outputHash: hashJson(scenario),
  });
}

function findUnsupportedFeatures(manifest: ProjectManifestV2) {
  const unsupported: Array<{ path: string; reason: string; severity: "warning" | "error" | "blocking" }> = [];
  const strict = manifest.designMode === "challenge" || manifest.designMode === "professional" || manifest.designMode === "research";
  const severity = strict ? "blocking" : "warning";

  if (!manifest.compiledScenario) {
    unsupported.push({
      path: "compiledScenario",
      reason: "Adapter only compiles when a supported Scenario V1 is attached.",
      severity,
    });
  }

  if (manifest.designDocument.layoutGraphRef && !manifest.compiledScenario) {
    unsupported.push({
      path: "designDocument.layoutGraphRef",
      reason: "LayoutGraph compilation is outside this narrow adapter.",
      severity,
    });
  }

  if (manifest.aiProposals.length > 0) {
    unsupported.push({
      path: "aiProposals",
      reason: "AI proposals are proposal-plane content and are never compiled directly.",
      severity,
    });
  }

  return unsupported;
}

function issueFromUnsupported(mode: DesignMode, path: string, reason: string, severity: "warning" | "error" | "blocking"): ModeValidationIssue {
  return ModeValidationIssueSchema.parse({
    code: "unsupported-compile-feature",
    severity,
    path,
    message: reason,
    mode,
    canUserOverride: severity === "warning",
  });
}

function hashJson(value: unknown) {
  return deterministicHash(stableStringify(value));
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function deterministicHash(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
