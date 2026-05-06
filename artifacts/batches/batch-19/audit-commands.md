# Audit Commands

```text
pnpm --filter @commons-sim/shared build
pnpm --filter @commons-sim/shared test
pnpm --filter @commons-sim/engine build
pnpm --filter @commons-sim/engine test
pnpm --filter @commons-sim/web build
pnpm build
pnpm test
pnpm determinism:check
node scripts/controls/run-local-validation.mjs --operator codex-batch-19-audit --include-docker
```

Full local validation output is stored in `artifacts/controls/local-validation/latest.json`.
