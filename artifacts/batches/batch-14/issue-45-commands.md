# Issue #45 Commands

Issue: Create Generic Module Template Contract

- `pnpm --filter @commons-sim/shared build` - PASS
- `pnpm --filter @commons-sim/shared test` - PASS, 36 tests passed
- `git diff --check` - pending final full validation
- `pnpm build` - pending final full validation
- `pnpm test` - pending final full validation
- `pnpm determinism:check` - pending final full validation
- `pnpm env:parity:check` - pending final full validation
- `node packages/cli/dist/main.js registry-validate examples/modules/registry.valid.json` - pending final full validation
- `node scripts/controls/run-local-validation.mjs --operator codex-phase-c --include-docker` - pending final Docker-inclusive validation

Manual checks:

- Confirmed generic template schema is contract-only.
- Confirmed templates remain product-agnostic.
- Confirmed invalid product-specific fixture fails.
- Confirmed no engine files changed.
- Confirmed no graph compiler or module execution was implemented.
