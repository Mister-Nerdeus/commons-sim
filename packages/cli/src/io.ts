import fs from "node:fs";
import path from "node:path";
import { ProjectManifestSchema, ScenarioSchema, type ProjectManifest, type Scenario } from "@commons-sim/shared";

export function loadScenario(filePath: string): Scenario {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, "utf-8");
  const json = JSON.parse(raw);
  return ScenarioSchema.parse(json);
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
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, "utf-8");
  const json = JSON.parse(raw);
  return ProjectManifestSchema.parse(json);
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
