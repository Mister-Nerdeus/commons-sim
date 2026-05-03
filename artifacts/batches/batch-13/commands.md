# Batch 13 Commands

- `git diff --check` - PASS
- `pnpm --filter @commons-sim/shared build` - PASS
- `pnpm --filter @commons-sim/shared test` - PASS, 33 tests passed
- `pnpm --filter @commons-sim/cli build` - PASS
- `pnpm --filter @commons-sim/cli test` - PASS, 12 tests passed
- `pnpm build` - PASS
- `pnpm test` - PASS
- `pnpm determinism:check` - PASS, hash `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`
- `pnpm env:parity:check` - PASS
- `node packages/cli/dist/main.js registry-validate examples/modules/registry.valid.json` - PASS, exit 0
- `node packages/cli/dist/main.js registry-validate examples/modules/registry.invalid.json` - PASS, expected exit 3 with `ok: false`
- `node scripts/controls/run-local-validation.mjs --operator codex-batch-13 --include-docker` - PASS

Host note: local host Node remains `v22.16.0`, while repo policy wants Node `20.x`; Docker-inclusive validation runs the canonical container path.
