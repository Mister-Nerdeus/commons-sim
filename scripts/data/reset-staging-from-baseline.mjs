import { appendFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const operator = getArg("--operator") ?? "unknown-operator";

const baselinePath = resolve("artifacts/data/staging-baseline/baseline-record.json");
const logPath = resolve("artifacts/data/staging-baseline/reset-log.md");

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const timestamp = new Date().toISOString();
const line = `- ${timestamp} - reset requested by ${operator} using baseline ${baseline.sourceSha}\n`;

appendFileSync(logPath, line, "utf8");

console.log(
  JSON.stringify(
    {
      ok: true,
      baselineSourceSha: baseline.sourceSha,
      logPath,
      timestamp,
    },
    null,
    2,
  ),
);

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}
