# Batch 08 Validation Command Log

## Commands Run

```powershell
pnpm build
pnpm test
node scripts/parity/verify-env-parity.mjs
node scripts/parity/verify-seed-contract.mjs
node scripts/scenarios/generate-canonical-benchmarks.mjs
node packages/cli/dist/main.js project-save scenarios/baseline-48.json examples/projects/baseline.project.json
node packages/cli/dist/main.js project-load examples/projects/baseline.project.json
node packages/cli/dist/main.js sensitivity examples/scenarios/canonical/cn-001-balanced-48.json
```

## Notes

- All commands completed successfully.
- Node engine warning appears because runtime is Node 22 while repo target is Node 20.x.
