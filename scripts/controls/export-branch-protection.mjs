import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const repo = getArg("--repo") ?? process.env.GITHUB_REPOSITORY;
const branches = (getArg("--branches") ?? "develop,staging,main")
  .split(",")
  .map((branch) => branch.trim())
  .filter(Boolean);
const outDir = resolve(getArg("--out-dir") ?? "artifacts/controls/branch-protection");
const operator = getArg("--operator") ?? process.env.GITHUB_ACTOR ?? "unknown-operator";

if (!repo) {
  throw new Error("Missing repository. Pass --repo owner/name or set GITHUB_REPOSITORY.");
}

mkdirSync(outDir, { recursive: true });

for (const branch of branches) {
  const endpoint = `repos/${repo}/branches/${encodeURIComponent(branch)}/protection`;
  const outputPath = resolve(outDir, `${branch}.json`);
  const evidence = {
    schemaVersion: 1,
    evidenceType: "github-branch-protection",
    repository: repo,
    branch,
    exportedAtUtc: new Date().toISOString(),
    exportedBy: operator,
    source: `gh api ${endpoint}`,
    status: "unknown",
    protection: null,
    error: null,
  };

  try {
    evidence.protection = JSON.parse(execFileSync("gh", ["api", endpoint], { encoding: "utf8" }));
    evidence.status = "exported";
  } catch (error) {
    evidence.status = "unavailable";
    evidence.error = {
      message: error.message,
      stderr: String(error.stderr ?? "").trim(),
      stdout: String(error.stdout ?? "").trim(),
    };
  }

  writeJson(outputPath, evidence);
  console.log(JSON.stringify({ branch, status: evidence.status, path: outputPath }));
}

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
