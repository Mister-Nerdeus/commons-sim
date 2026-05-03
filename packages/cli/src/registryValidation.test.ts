import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = repoRoot();
const cliEntry = path.join(root, "packages/cli/dist/main.js");

test("registry-validate returns machine-readable success JSON", () => {
  const result = spawnSync(process.execPath, [cliEntry, "registry-validate", "examples/modules/registry.valid.json"], {
    cwd: root,
    encoding: "utf-8",
  });

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(parsed, {
    ok: true,
    registryId: "core-human-settlement-v1",
    moduleCount: 3,
  });
});

test("registry-validate returns machine-readable failure JSON", () => {
  const result = spawnSync(process.execPath, [cliEntry, "registry-validate", "examples/modules/registry.invalid.json"], {
    cwd: root,
    encoding: "utf-8",
  });

  assert.equal(result.status, 3);
  const parsed = JSON.parse(result.stderr);
  assert.equal(parsed.error.code, "MODULE_REGISTRY_VALIDATION_ERROR");
});

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
