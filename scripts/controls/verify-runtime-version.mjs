import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const packageJsonPath = resolve("package.json");
const outPath = resolve(getArg("--out") ?? "artifacts/batches/batch-17/issue-51-runtime-proof.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

const expectedNode = packageJson.engines?.node;
const expectedPnpm = packageJson.engines?.pnpm;
const actualNode = process.version;
const actualPnpm = run("pnpm", ["--version"]).stdout.trim();

if (!expectedNode || !expectedPnpm) {
  throw new Error("Root package.json must declare engines.node and engines.pnpm");
}

const ok = versionMatches(expectedNode, actualNode) && versionMatches(expectedPnpm, actualPnpm);
const proof = {
  schemaVersion: 1,
  evidenceType: "runtime-version-proof",
  generatedAtUtc: new Date().toISOString(),
  expectedNode,
  actualNode,
  expectedPnpm,
  actualPnpm,
  ok,
};

writeJson(outPath, proof);
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

function versionMatches(expected, actual) {
  const actualMajor = parseMajor(actual);
  const majorRange = /^(\d+)\.x$/.exec(expected);
  if (majorRange) {
    return actualMajor === Number(majorRange[1]);
  }

  const exact = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(expected);
  if (exact) {
    return stripV(actual) === stripV(expected);
  }

  throw new Error(`Unsupported engine policy "${expected}". Use "N.x" or an exact semver.`);
}

function parseMajor(version) {
  const match = /^v?(\d+)/.exec(version);
  if (!match) throw new Error(`Cannot parse version "${version}"`);
  return Number(match[1]);
}

function stripV(version) {
  return String(version).replace(/^v/, "");
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
