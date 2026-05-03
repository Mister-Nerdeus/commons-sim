import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const sourceSha = getArg("--source-sha") ?? "unknown";
const operator = getArg("--operator") ?? "unknown-operator";
const reason = getArg("--reason") ?? "baseline provenance refresh";
const recordPath = resolve("artifacts/data/staging-baseline/baseline-record.json");

mkdirSync(dirname(recordPath), { recursive: true });

const record = {
  schemaVersion: 2,
  artifactType: "staging-baseline-provenance",
  baselineName: "staging-main-cutover",
  sourceBranch: "main",
  sourceSha,
  capturedAtUtc: new Date().toISOString(),
  capturedBy: operator,
  resetContract: "metadata-only",
  stateRestoreImplemented: false,
  reason,
  notes:
    "Baseline captures provenance for the staging cutover. It does not contain a database snapshot or full application-state restore payload.",
};

writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");

const readBack = JSON.parse(readFileSync(recordPath, "utf8"));
console.log(JSON.stringify({ ok: true, path: recordPath, sourceSha: readBack.sourceSha }, null, 2));

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}
