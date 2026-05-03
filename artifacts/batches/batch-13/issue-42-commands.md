# Issue #42 Commands

- `pnpm --filter @commons-sim/cli build` - PASS
- `pnpm --filter @commons-sim/cli test` - PASS
- `node packages/cli/dist/main.js registry-validate examples/modules/registry.valid.json` - PASS, exit 0
- `node packages/cli/dist/main.js registry-validate examples/modules/registry.invalid.json` - PASS, exit 3 observed through `$LASTEXITCODE`
- `pnpm build` - PASS
- `pnpm test` - PASS
- `pnpm determinism:check` - PASS, hash `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`

Success JSON includes ok true: PASS
Failure JSON includes ok false: PASS
Failure exit code is nonzero: PASS
No engine behavior changed: PASS
No determinism update required: PASS
