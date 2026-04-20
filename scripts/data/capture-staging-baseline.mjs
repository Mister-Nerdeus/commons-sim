import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const sourceSha = getArg("--source-sha") ?? "unknown";
const operator = getArg("--operator") ?? "unknown-operator";
const recordPath = resolve("artifacts/data/staging-baseline/baseline-record.json");

mkdirSync(dirname(recordPath), { recursive: true });

const record = {
  baselineName: "staging-main-cutover",
  sourceBranch: "main",
  sourceSha,
  capturedAtUtc: new Date().toISOString(),
  capturedBy: operator,
  notes: "Baseline captured via scripted contract",
};

writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");

const readBack = JSON.parse(readFileSync(recordPath, "utf8"));
console.log(JSON.stringify({ ok: true, path: recordPath, sourceSha: readBack.sourceSha }, null, 2));

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}
