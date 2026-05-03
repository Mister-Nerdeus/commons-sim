# Batch 12 Commands

```powershell
pnpm --filter @commons-sim/shared build
pnpm --filter @commons-sim/shared test
pnpm --filter @commons-sim/cli build
pnpm --filter @commons-sim/cli test
pnpm build
pnpm test
pnpm determinism:check
pnpm env:parity:check
node packages/cli/dist/main.js registry-validate examples/modules/registry.valid.json
node scripts/controls/run-local-validation.mjs --operator codex-phase-b --include-docker
```

Result: pass.

Local host note: host Node is `v22.16.0`, so pnpm emits an engine warning. Release-grade validation runs in `Dockerfile.local-validation` using Node `20.19.0`.
