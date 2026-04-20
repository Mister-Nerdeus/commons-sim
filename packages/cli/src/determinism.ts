import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { simulateScenario } from "@commons-sim/engine";
import { loadScenario, stableStringify } from "./io.js";
import { sha256 } from "./hash.js";

export type GoldenEntry = {
  id: string;
  scenarioPath: string;
  snapshotPath: string;
  hashPath: string;
};

function moduleDir() {
  return path.dirname(fileURLToPath(import.meta.url));
}

export function repoRoot() {
  return path.resolve(moduleDir(), "../../..");
}

export function defaultGoldenMatrix(): GoldenEntry[] {
  const root = repoRoot();
  return [
    {
      id: "baseline-48",
      scenarioPath: path.join(root, "scenarios/baseline-48.json"),
      snapshotPath: path.join(root, "scenarios/goldens/baseline-48.snapshot.json"),
      hashPath: path.join(root, "scenarios/goldens/baseline-48.snapshot.sha256"),
    },
  ];
}

export function generateGolden(entry: GoldenEntry) {
  const scenario = loadScenario(entry.scenarioPath);
  const output = simulateScenario(scenario);
  const snapshotText = stableStringify(output);
  const hash = sha256(snapshotText);
  return { snapshotText, hash };
}

export function verifyHash(expectedHash: string, actualHash: string, id: string) {
  if (expectedHash !== actualHash) {
    throw new Error(`DETERMINISM FAIL [${id}] expected=${expectedHash} actual=${actualHash}`);
  }
}

export function initGoldens(matrix = defaultGoldenMatrix()) {
  for (const entry of matrix) {
    const { snapshotText, hash } = generateGolden(entry);
    fs.mkdirSync(path.dirname(entry.snapshotPath), { recursive: true });
    fs.writeFileSync(entry.snapshotPath, snapshotText, "utf-8");
    fs.writeFileSync(entry.hashPath, hash + "\n", "utf-8");
    console.log(`Initialized golden [${entry.id}] hash=${hash}`);
  }
}

export function checkGoldens(matrix = defaultGoldenMatrix()) {
  for (const entry of matrix) {
    if (!fs.existsSync(entry.snapshotPath) || !fs.existsSync(entry.hashPath)) {
      throw new Error(`Missing golden files for ${entry.id}. Run determinism:init locally.`);
    }

    const expectedHash = fs.readFileSync(entry.hashPath, "utf-8").trim();
    const { hash } = generateGolden(entry);
    verifyHash(expectedHash, hash, entry.id);
    console.log(`Determinism OK [${entry.id}] hash=${hash}`);
  }
}
