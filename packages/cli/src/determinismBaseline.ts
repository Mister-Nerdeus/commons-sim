import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { simulateScenario } from "@commons-sim/engine";
import { loadScenario, stableStringify } from "./io.js";
import { sha256 } from "./hash.js";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(thisDir, "../../..");

const scenarioPath = path.join(repoRoot, "scenarios/baseline-48.json");
const snapshotPath = path.join(repoRoot, "scenarios/baseline-48.snapshot.json");
const hashPath = path.join(repoRoot, "scenarios/baseline-48.snapshot.sha256");

const s = loadScenario(scenarioPath);
const out = simulateScenario(s);
const text = stableStringify(out);
const hash = sha256(text);

if (!fs.existsSync(snapshotPath) || !fs.existsSync(hashPath)) {
  fs.writeFileSync(snapshotPath, text, "utf-8");
  fs.writeFileSync(hashPath, hash + "\n", "utf-8");
  console.log("Created baseline snapshot + hash.");
  process.exit(0);
}

const expected = fs.readFileSync(hashPath, "utf-8").trim();
if (expected !== hash) {
  console.error("DETERMINISM FAIL:");
  console.error(`expected=${expected}`);
  console.error(`actual  =${hash}`);
  console.error("If intentional, update snapshot by deleting the snapshot files and re-running.");
  process.exit(1);
}

console.log("Determinism OK:", hash);
