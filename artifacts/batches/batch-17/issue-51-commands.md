# Issue 51 Commands

```text
git pull --ff-only origin develop
node --version
pnpm --version
node scripts/controls/verify-runtime-version.mjs
pnpm --filter @commons-sim/shared build
pnpm --filter @commons-sim/engine build
pnpm --filter @commons-sim/web build
```

Runtime proof: `artifacts/batches/batch-17/issue-51-runtime-proof.json`.

Intentional stale SHA check was executed with a temporary evidence file containing `0000000000000000000000000000000000000000`; `verify-local-validation-current.mjs` returned `ok: false` and exit code 1 as expected.
