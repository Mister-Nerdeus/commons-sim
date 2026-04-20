# Local Setup

## Toolchain Decision Note
- Node runtime: `20.19.0` (single supported major: `20.x`).
- Package manager: `pnpm@9.x` only.
- Module/runtime format: ESM (`"type": "module"`) across packages.
- TypeScript baseline: root `tsconfig.base.json`; package tsconfigs extend it and explicitly declare Node types where needed.

## Known Environment Assumptions
- OS: macOS, Linux, or Windows with Node 20 installed.
- Corepack is available (`corepack` ships with modern Node).
- Git working copy starts from repository root.

## Clean Clone Setup
```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
nvm use 20.19.0
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm smoke:cli
pnpm determinism:check
```

## Verification Commands
```bash
pnpm --version
node --version
pnpm build
pnpm test
pnpm smoke:cli
pnpm determinism:init
pnpm determinism:check
```

## CI Parity
CI (`.github/workflows/ci.yml`) runs the same install/build/test/smoke flow with Node `20.19.0` and `pnpm install --frozen-lockfile`.

## Troubleshooting
- If `--frozen-lockfile` fails, do not bypass it in CI. Regenerate lockfile locally with approved dependency changes and commit the updated lockfile.
- If Node is not `20.x`, switch versions before running setup commands.
