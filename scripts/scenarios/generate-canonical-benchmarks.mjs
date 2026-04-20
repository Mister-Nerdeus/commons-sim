import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(".");
const canonicalDir = resolve("examples/scenarios/canonical");
const cliEntry = resolve("packages/cli/dist/main.js");
const outputPath = resolve("artifacts/scenarios/canonical-benchmark-results.json");

const files = readdirSync(canonicalDir).filter((f) => f.endsWith(".json")).sort();
const results = [];

for (const file of files) {
  const scenarioPath = join(canonicalDir, file);
  const run = spawnSync(process.execPath, [cliEntry, "run", scenarioPath], {
    cwd: root,
    encoding: "utf8",
  });

  if (run.status !== 0) {
    console.error(run.stderr || run.stdout);
    process.exit(run.status ?? 1);
  }

  const output = JSON.parse(run.stdout);
  results.push({
    scenarioId: output.scenarioId,
    horizonMonths: output.horizonMonths,
    summary: output.summary,
    meta: output.meta,
  });
}

const artifact = {
  generatedAtUtc: new Date().toISOString(),
  scenarioCount: results.length,
  results,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ok: true, outputPath, scenarioCount: results.length }, null, 2));
