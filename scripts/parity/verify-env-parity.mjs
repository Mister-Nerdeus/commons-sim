import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workflowExpectations = [
  { path: ".github/workflows/deploy-dev.yml", branch: "develop", environment: "dev" },
  { path: ".github/workflows/deploy-staging.yml", branch: "staging", environment: "staging" },
  { path: ".github/workflows/deploy-prod.yml", branch: "main", environment: "production" },
];

const results = workflowExpectations.map((item) => checkWorkflow(item.path, item.branch, item.environment));
const failures = results.filter((r) => !r.ok);

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checks: results }, null, 2));

function checkWorkflow(relPath, branch, environment) {
  const fullPath = resolve(relPath);
  const text = readFileSync(fullPath, "utf8");
  const hasBranch = text.includes(`branches: [${branch}]`);
  const hasEnvironment = text.includes(`name: ${environment}`);

  return {
    path: relPath,
    branch,
    environment,
    ok: hasBranch && hasEnvironment,
    hasBranch,
    hasEnvironment,
  };
}
