import {
  DesignModeSchema,
  LayoutGraphSchema,
  ModeValidationIssueSchema,
  ProjectManifestV2Schema,
  type DesignMode,
  type LayoutGraph,
  type ModeValidationIssue,
  type ProjectManifestV2,
} from "@commons-sim/shared";
import { z } from "zod";

export const PolygonVillageGeneratorInputSchema = z.object({
  generatorVersion: z.literal(1),
  preset: z.enum(["dodecagon-pod", "polygon-garden-village-24gon"]),
  seed: z.number().int(),
  designMode: DesignModeSchema,
  sideCount: z.union([z.literal(12), z.literal(24)]),
  populationTarget: z.number().int().positive(),
  housingUnitTarget: z.number().int().positive(),
  diameter: z.object({
    value: z.number().positive(),
    unit: z.enum(["ft", "m"]),
  }),
  styleTags: z.array(z.string()),
});
export type PolygonVillageGeneratorInput = z.infer<typeof PolygonVillageGeneratorInputSchema>;

export const PolygonVillageGeneratorOutputSchema = z.object({
  generatorVersion: z.literal(1),
  generatorId: z.string().min(1),
  inputHash: z.string().min(1),
  outputHash: z.string().min(1),
  manifest: ProjectManifestV2Schema,
  warnings: z.array(ModeValidationIssueSchema),
});
export type PolygonVillageGeneratorOutput = z.infer<typeof PolygonVillageGeneratorOutputSchema>;

export function generatePolygonVillage(input: PolygonVillageGeneratorInput): PolygonVillageGeneratorOutput {
  const parsed = PolygonVillageGeneratorInputSchema.parse(input);
  if (parsed.preset === "dodecagon-pod" && parsed.sideCount !== 12) {
    throw new Error("dodecagon-pod requires sideCount 12");
  }
  if (parsed.preset === "polygon-garden-village-24gon" && parsed.sideCount !== 24) {
    throw new Error("polygon-garden-village-24gon requires sideCount 24");
  }

  const radius = parsed.diameter.value / 2;
  const layout = buildLayoutGraph(parsed, radius);
  const warnings: ModeValidationIssue[] = [
    {
      code: "deterministic-draft",
      severity: "warning",
      path: "designDocument",
      message: "Generated layout is a deterministic editable draft, not professional validity.",
      mode: parsed.designMode,
      canUserOverride: true,
    },
  ];

  const now = "2026-05-05T00:00:00.000Z";
  const manifest: ProjectManifestV2 = ProjectManifestV2Schema.parse({
    manifestVersion: 2,
    projectId: `${parsed.preset}.seed-${parsed.seed}`,
    projectTitle: titleForPreset(parsed.preset),
    createdAtUtc: now,
    updatedAtUtc: now,
    sourceBranch: "develop",
    designMode: parsed.designMode,
    designDocument: {
      designVersion: 1,
      designId: `${parsed.preset}.seed-${parsed.seed}.design`,
      title: titleForPreset(parsed.preset),
      description: "Deterministic polygon village draft with editable layout storage.",
      layoutGraphRef: `${layout.layoutId}.inline`,
      userAnnotations: [
        `Population target: ${parsed.populationTarget}`,
        `Housing unit target: ${parsed.housingUnitTarget}`,
        "No professional validity or build approval is implied.",
      ],
      tags: ["generated", ...parsed.styleTags],
    },
    validationResults: [
      {
        ok: true,
        mode: parsed.designMode,
        canSave: true,
        canSimulate: false,
        canSubmitToLeaderboard: false,
        canExportProfessionalReport: false,
        issueCount: warnings.length,
        issues: warnings,
      },
    ],
    aiProposals: [],
    metadata: {
      notes: JSON.stringify({ layoutGraph: layout }),
      author: "deterministic-polygon-village-generator",
    },
  });

  const manifestHash = hashJson(manifest);
  return PolygonVillageGeneratorOutputSchema.parse({
    generatorVersion: 1,
    generatorId: "polygon-village-generator",
    inputHash: hashJson(parsed),
    outputHash: manifestHash,
    manifest,
    warnings,
  });
}

function buildLayoutGraph(input: PolygonVillageGeneratorInput, radius: number): LayoutGraph {
  return LayoutGraphSchema.parse({
    layoutVersion: 1,
    layoutId: `${input.preset}.seed-${input.seed}.layout`,
    title: `${titleForPreset(input.preset)} Layout`,
    units: input.diameter.unit,
    coordinateSystem: "local-cartesian",
    designMode: input.designMode,
    scale: { value: 1, unit: input.diameter.unit },
    nodes: [
      {
        id: "outer-service-ring",
        kind: "service-road",
        geometry: {
          type: "ring",
          center: { x: 0, y: 0 },
          innerRadius: radius * 0.9,
          outerRadius: radius,
          sideCount: input.sideCount,
        },
        label: "Outer Service Ring",
      },
      {
        id: "housing-ring",
        kind: "lot",
        geometry: {
          type: "regular-polygon",
          center: { x: 0, y: 0 },
          radius: radius * 0.78,
          sideCount: input.sideCount,
          rotationDegrees: 180 / input.sideCount,
        },
        label: "Housing Ring",
      },
      {
        id: "inner-green",
        kind: "green-space",
        geometry: {
          type: "regular-polygon",
          center: { x: 0, y: 0 },
          radius: radius * 0.32,
          sideCount: input.sideCount,
          rotationDegrees: 180 / input.sideCount,
        },
        label: "Inner Green Space",
      },
      {
        id: "central-hub",
        kind: "community-hub",
        geometry: {
          type: "regular-polygon",
          center: { x: 0, y: 0 },
          radius: radius * 0.14,
          sideCount: Math.min(input.sideCount, 12),
          rotationDegrees: 0,
        },
        label: "Central Hub",
      },
      {
        id: "walking-loop",
        kind: "path",
        geometry: {
          type: "ring",
          center: { x: 0, y: 0 },
          innerRadius: radius * 0.42,
          outerRadius: radius * 0.45,
          sideCount: input.sideCount,
        },
        label: "Walking Loop",
      },
      {
        id: "north-utility-corridor",
        kind: "utility-corridor",
        geometry: {
          type: "path",
          points: [
            { x: 0, y: 0 },
            { x: 0, y: radius },
          ],
          width: radius * 0.04,
        },
        label: "North Utility Corridor",
      },
    ],
    edges: [
      { id: "road-serves-housing", fromNodeId: "outer-service-ring", toNodeId: "housing-ring", kind: "serves", label: "" },
      { id: "housing-contains-green", fromNodeId: "housing-ring", toNodeId: "inner-green", kind: "contains", label: "" },
      { id: "loop-adjacent-green", fromNodeId: "walking-loop", toNodeId: "inner-green", kind: "adjacent-to", label: "" },
      { id: "corridor-serves-hub", fromNodeId: "north-utility-corridor", toNodeId: "central-hub", kind: "serves", label: "" },
    ],
    metadata: {
      seed: input.seed,
      generatorId: "polygon-village-generator",
      notes: "Deterministic layout storage only.",
      tags: input.styleTags,
    },
  });
}

function titleForPreset(preset: PolygonVillageGeneratorInput["preset"]) {
  return preset === "dodecagon-pod" ? "Dodecagon Pod" : "Polygon Garden Village 24-Gon";
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
