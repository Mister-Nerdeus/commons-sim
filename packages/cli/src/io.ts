import fs from "node:fs";
import path from "node:path";
import {
  ChallengeBenchmarkSchema,
  ChallengeSubmissionSchema,
  ModuleRegistrySchema,
  ProjectManifestSchema,
  ScenarioSchema,
  type ChallengeBenchmark,
  type ChallengeSubmission,
  type ModuleRegistry,
  type ProjectManifest,
  type Scenario,
} from "@commons-sim/shared";

export function loadScenario(filePath: string): Scenario {
  return ScenarioSchema.parse(loadJson(filePath));
}

export function loadChallengeBenchmark(filePath: string): ChallengeBenchmark {
  return ChallengeBenchmarkSchema.parse(loadJson(filePath));
}

export function loadChallengeSubmission(filePath: string): ChallengeSubmission {
  return ChallengeSubmissionSchema.parse(loadJson(filePath));
}

export function loadModuleRegistry(filePath: string): ModuleRegistry {
  return ModuleRegistrySchema.parse(loadJson(filePath));
}

export function stableStringify(obj: unknown): string {
  // Minimal stable stringify: recursively sort keys.
  // (Phase 1: keep deterministic output snapshots stable across Node versions)
  return JSON.stringify(sortKeys(obj), null, 2);
}

export function saveProjectManifest(filePath: string, manifest: ProjectManifest): void {
  const abs = path.resolve(filePath);
  fs.writeFileSync(abs, `${stableStringify(manifest)}\n`, "utf-8");
}

export function loadProjectManifest(filePath: string): ProjectManifest {
  return ProjectManifestSchema.parse(loadJson(filePath));
}

function loadJson(filePath: string): unknown {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, "utf-8");
  return JSON.parse(raw);
}

function sortKeys(x: any): any {
  if (Array.isArray(x)) return x.map(sortKeys);
  if (x && typeof x === "object") {
    const out: any = {};
    for (const k of Object.keys(x).sort()) out[k] = sortKeys(x[k]);
    return out;
  }
  return x;
}
