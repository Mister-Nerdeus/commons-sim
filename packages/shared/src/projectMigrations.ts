import { ProjectManifestSchema, type ProjectManifest } from "./projectManifest.js";

export type MigrationResult = {
  manifest: ProjectManifest;
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
