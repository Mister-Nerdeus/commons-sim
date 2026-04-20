import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const baselinePath = resolve("artifacts/data/staging-baseline/baseline-record.json");
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));

const requiredFields = ["baselineName", "sourceBranch", "sourceSha", "capturedAtUtc", "capturedBy"];
const missing = requiredFields.filter((field) => baseline[field] === undefined || baseline[field] === "");

if (missing.length > 0) {
  console.error(JSON.stringify({ ok: false, missing, baselinePath }, null, 2));
  process.exit(1);
}

if (baseline.sourceBranch !== "main") {
  console.error(JSON.stringify({ ok: false, reason: "baseline sourceBranch must be main", baselinePath }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, baselinePath, sourceSha: baseline.sourceSha }, null, 2));
