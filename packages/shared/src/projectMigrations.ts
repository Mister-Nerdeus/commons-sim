import { ProjectManifestSchema, type ProjectManifest } from "./projectManifest.js";
import { ProjectManifestV2Schema, type ProjectManifestV2 } from "./projectManifestV2.js";

export type MigrationResult = {
  manifest: ProjectManifest;
  migratedFrom: number | null;
};

export type MigrationToV2Result = {
  manifest: ProjectManifestV2;
  migratedFrom: number | null;
};

export function migrateProjectManifest(input: unknown): MigrationResult {
  const asAny = input as any;

  if (asAny?.manifestVersion === 1) {
    return { manifest: ProjectManifestSchema.parse(asAny), migratedFrom: null };
  }

  // Legacy v0 compatibility:
  // {
  //   version: 0,
  //   id: string,
  //   title: string,
  //   scenario: Scenario,
  //   savedAtUtc?: string
  // }
  if (asAny?.version === 0 && asAny?.scenario) {
    const timestamp = asAny.savedAtUtc ?? new Date().toISOString();
    const migrated: ProjectManifest = ProjectManifestSchema.parse({
      manifestVersion: 1,
      projectId: asAny.id ?? asAny.scenario.id ?? "legacy-project",
      projectTitle: asAny.title ?? asAny.scenario.title ?? "Legacy Project",
      createdAtUtc: timestamp,
      updatedAtUtc: timestamp,
      sourceBranch: "develop",
      scenario: asAny.scenario,
      metadata: {
        notes: "Migrated from project manifest v0",
        engineVersion: "0.1.0",
      },
    });

    return { manifest: migrated, migratedFrom: 0 };
  }

  return { manifest: ProjectManifestSchema.parse(asAny), migratedFrom: null };
}

export function migrateProjectManifestToV2(input: unknown): MigrationToV2Result {
  const asAny = input as any;

  if (asAny?.manifestVersion === 2) {
    return { manifest: ProjectManifestV2Schema.parse(asAny), migratedFrom: null };
  }

  const v1Result = migrateProjectManifest(input);
  const v1 = v1Result.manifest;
  const migrated = ProjectManifestV2Schema.parse({
    manifestVersion: 2,
    projectId: v1.projectId,
    projectTitle: v1.projectTitle,
    createdAtUtc: v1.createdAtUtc,
    updatedAtUtc: v1.updatedAtUtc,
    sourceBranch: v1.sourceBranch,
    designMode: "soft-sim",
    designDocument: {
      designVersion: 1,
      designId: `${v1.projectId}-design`,
      title: v1.projectTitle,
      description: "Migrated from ProjectManifest V1 compiled scenario.",
      userAnnotations: [],
      tags: ["migrated-v1"],
    },
    compiledScenario: v1.scenario,
    validationResults: [],
    aiProposals: [],
    metadata: {
      notes: v1.metadata.notes,
      engineVersion: v1.metadata.engineVersion,
    },
  });

  return { manifest: migrated, migratedFrom: v1Result.migratedFrom ?? 1 };
}
