# Issue #47 Commands

- `pnpm --filter @commons-sim/shared build` - PASS
- `pnpm --filter @commons-sim/shared test` - PASS, 52 tests passed
- `pnpm build` - PASS
- `pnpm test` - PASS
- `pnpm determinism:check` - PASS, hash `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`
- `node packages/cli/dist/main.js registry-validate examples/modules/registry.valid.json` - PASS

Host note: local host Node is `v22.16.0`; repo policy wants Node `20.x`. Docker-inclusive validation passed in the batch audit gate.
