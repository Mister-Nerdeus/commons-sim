import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const environmentExpectations = [
  { branch: "develop", environment: "dev", artifact: "artifacts/controls/environments/dev.json" },
  { branch: "staging", environment: "staging", artifact: "artifacts/controls/environments/staging.json" },
  { branch: "main", environment: "production", artifact: "artifacts/controls/environments/production.json" },
];

const results = environmentExpectations.map((item) => checkEnvironmentArtifact(item));
const failures = results.filter((r) => !r.ok);

if (failures.length > 0) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checks: results }, null, 2));

function checkEnvironmentArtifact(expectation) {
  const fullPath = resolve(expectation.artifact);
  const hasArtifact = existsSync(fullPath);
  const parsed = hasArtifact ? JSON.parse(readFileSync(fullPath, "utf8")) : null;
  const hasEnvironment = parsed?.environment === expectation.environment;
  const exported = parsed?.status === "exported";

  return {
    artifact: expectation.artifact,
    branch: expectation.branch,
    environment: expectation.environment,
    ok: hasArtifact && hasEnvironment && exported,
    hasArtifact,
    hasEnvironment,
    exported,
  };
}
