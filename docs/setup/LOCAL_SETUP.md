# Local Setup

## Toolchain Decision Note
- Node runtime: `20.19.0` (single supported major: `20.x`).
- Package manager: `pnpm@9.0.0` (`9.x` major only after policy update).
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

## Local Validation and Docker Parity
GitHub Actions is not the acceptance gate. Local validation and Docker validation run the install integrity contract with Node `20.19.0`, pnpm `9.0.0`, and `pnpm install --frozen-lockfile`.

Docker build images use `node:20.19.0-alpine` and activate `pnpm@9.0.0` through Corepack. The workflow runtime policy is maintained in `docs/program/WORKFLOW_RUNTIME_POLICY.md`.

Release-grade local validation:

```bash
docker build -f Dockerfile.local-validation -t commons-sim:local-validation .
```

Transcript-producing validation:

```bash
node scripts/controls/run-local-validation.mjs --operator <name> --include-docker
```

## Troubleshooting
- If `--frozen-lockfile` fails, do not bypass it in CI. Regenerate lockfile locally with approved dependency changes and commit the updated lockfile.
- If Node is not `20.x`, switch versions before running setup commands.
