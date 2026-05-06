import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const evidencePath = resolve(getArg("--evidence") ?? "artifacts/controls/local-validation/latest.json");
const outPathArg = getArg("--out");

const currentHeadSha = run("git", ["rev-parse", "HEAD"]).stdout.trim();
const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
const localValidationSha = String(evidence.gitSha ?? "");
const ok = currentHeadSha === localValidationSha;

const proof = {
  schemaVersion: 1,
  evidenceType: "local-validation-current-proof",
  generatedAtUtc: new Date().toISOString(),
  currentHeadSha,
  localValidationSha,
  ok,
};

if (outPathArg) {
  writeJson(resolve(outPathArg), proof);
}

console.log(JSON.stringify(proof, null, 2));

if (!ok) {
  process.exitCode = 1;
}

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function run(command, commandArgs) {
  return spawnSync(command, commandArgs, {
    encoding: "utf8",
    shell: process.platform === "win32",
    windowsHide: true,
  });
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
