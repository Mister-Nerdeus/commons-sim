import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const repo = getArg("--repo") ?? process.env.GITHUB_REPOSITORY;
const mapPath = getArg("--map") ?? "artifacts/controls/required-check-map.json";
const branchFilter = new Set(
  (getArg("--branches") ?? "")
    .split(",")
    .map((branch) => branch.trim())
    .filter(Boolean),
);
const dryRun = args.includes("--dry-run");
const enforceAdmins = args.includes("--enforce-admins");

if (!repo) {
  throw new Error("Missing repository. Pass --repo owner/name or set GITHUB_REPOSITORY.");
}

const map = JSON.parse(readFileSync(mapPath, "utf8"));

for (const [branch, contexts] of Object.entries(map.requiredChecksByBranch)) {
  if (branchFilter.size > 0 && !branchFilter.has(branch)) continue;

  const payload = protectionPayload(branch, contexts);
  const endpoint = `repos/${repo}/branches/${encodeURIComponent(branch)}/protection`;

  if (dryRun) {
    console.log(JSON.stringify({ branch, endpoint, payload }, null, 2));
    continue;
  }

  const result = spawnSync("gh", ["api", "--method", "PUT", endpoint, "--input", "-"], {
    encoding: "utf8",
    input: `${JSON.stringify(payload)}\n`,
  });

  if (result.status !== 0) {
    throw new Error(
      `Failed to apply protection for ${branch}: ${result.stderr.trim() || result.stdout.trim()}`,
    );
  }

  console.log(JSON.stringify({ branch, status: "protected" }));
}

function protectionPayload(branch, contexts) {
  const productionLike = branch === "main" || branch === "staging";

  return {
    required_status_checks: {
      strict: productionLike,
      contexts,
    },
    enforce_admins: enforceAdmins,
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      require_code_owner_reviews: productionLike,
      required_approving_review_count: 1,
    },
    restrictions: null,
    required_conversation_resolution: true,
    allow_force_pushes: false,
    allow_deletions: false,
  };
}

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}
