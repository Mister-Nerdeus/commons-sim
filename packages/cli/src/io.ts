import fs from "node:fs";
import path from "node:path";
import {
  ChallengeBenchmarkSchema,
  ChallengeSubmissionSchema,
  GenericModuleTemplateSchema,
  ModuleRegistrySchema,
  ProblemGraphSchema,
  ProjectManifestSchema,
  ResourceCompatibilityRuleSetSchema,
  ScenarioSchema,
  SolutionGraphSchema,
  WorldGraphSchema,
  type ChallengeBenchmark,
  type ChallengeSubmission,
  type GenericModuleTemplate,
  type ModuleRegistry,
  type ProblemGraph,
  type ProjectManifest,
  type ResourceCompatibilityRuleSet,
  type Scenario,
  type SolutionGraph,
  type WorldGraph,
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

export function loadGenericModuleTemplate(filePath: string): GenericModuleTemplate {
  return GenericModuleTemplateSchema.parse(loadJson(filePath));
}

export function loadResourceCompatibilityRuleSet(filePath: string): ResourceCompatibilityRuleSet {
  return ResourceCompatibilityRuleSetSchema.parse(loadJson(filePath));
}

export function loadGraphForLinkValidation(filePath: string): ProblemGraph | SolutionGraph | WorldGraph {
  const graph = loadJson(filePath);
  const solution = SolutionGraphSchema.safeParse(graph);
  if (solution.success) return solution.data;
  const problem = ProblemGraphSchema.safeParse(graph);
  if (problem.success) return problem.data;
  return WorldGraphSchema.parse(graph);
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
