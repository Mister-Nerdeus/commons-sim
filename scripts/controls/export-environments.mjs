import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const repo = getArg("--repo") ?? process.env.GITHUB_REPOSITORY;
const outDir = resolve(getArg("--out-dir") ?? "artifacts/controls/environments");
const operator = getArg("--operator") ?? process.env.GITHUB_ACTOR ?? "unknown-operator";

if (!repo) {
  throw new Error("Missing repository. Pass --repo owner/name or set GITHUB_REPOSITORY.");
}

mkdirSync(outDir, { recursive: true });

const listEndpoint = `repos/${repo}/environments`;
const listEvidence = {
  schemaVersion: 1,
  evidenceType: "github-environment-list",
  repository: repo,
  exportedAtUtc: new Date().toISOString(),
  exportedBy: operator,
  source: `gh api ${listEndpoint}`,
  status: "unknown",
  environments: [],
  error: null,
};

try {
  const list = JSON.parse(execFileSync("gh", ["api", listEndpoint], { encoding: "utf8" }));
  listEvidence.status = "exported";
  listEvidence.environments = list.environments ?? [];
} catch (error) {
  listEvidence.status = "unavailable";
  listEvidence.error = {
    message: error.message,
    stderr: String(error.stderr ?? "").trim(),
    stdout: String(error.stdout ?? "").trim(),
  };
}

writeJson(resolve(outDir, "index.json"), listEvidence);
console.log(JSON.stringify({ environments: listEvidence.environments.length, status: listEvidence.status }));

for (const environment of listEvidence.environments) {
  const name = environment.name;
  const endpoint = `repos/${repo}/environments/${encodeURIComponent(name)}`;
  const detailEvidence = {
    schemaVersion: 1,
    evidenceType: "github-environment",
    repository: repo,
    environment: name,
    exportedAtUtc: listEvidence.exportedAtUtc,
    exportedBy: operator,
    source: `gh api ${endpoint}`,
    status: "unknown",
    environmentSettings: null,
    error: null,
  };

  try {
    detailEvidence.environmentSettings = JSON.parse(
      execFileSync("gh", ["api", endpoint], { encoding: "utf8" }),
    );
    detailEvidence.status = "exported";
  } catch (error) {
    detailEvidence.status = "unavailable";
    detailEvidence.error = {
      message: error.message,
      stderr: String(error.stderr ?? "").trim(),
      stdout: String(error.stdout ?? "").trim(),
    };
  }

  writeJson(resolve(outDir, `${sanitizeFileName(name)}.json`), detailEvidence);
  console.log(JSON.stringify({ environment: name, status: detailEvidence.status }));
}

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function sanitizeFileName(value) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
