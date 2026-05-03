# Batch 11 Validation Log

## Commands

```powershell
node scripts/controls/run-local-validation.mjs --operator codex-local-validation --include-docker
docker build -f Dockerfile.local-validation -t commons-sim:local-validation .
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm env:parity:check
git diff --check
docker build -f Dockerfile -t commons-sim:web-batch11 .
docker build -f Dockerfile.api -t commons-sim:api-batch11 .
rg "frozen-lockfile=false|node-version: 20($|\r?$)|FROM node:20-alpine|CI checks green|`ci`, `determinism`" .github Dockerfile Dockerfile.api docs -n
```

## Results

- `pnpm install --frozen-lockfile`: pass; emitted local Node engine warning because the workstation runs Node `v22.16.0`.
- `pnpm build`: pass; emitted the same local Node warning.
- `pnpm test`: pass; emitted the same local Node warning. Server Postgres integration remained skipped because `COMMONS_SIM_TEST_DATABASE_URL` was not set.
- `pnpm env:parity:check`: pass; deploy workflow branch/environment references parse correctly.
- `git diff --check`: pass; line-ending warnings only.
- Docker web image build: pass with `node:20.19.0-alpine`.
- Docker API image build: pass with `node:20.19.0-alpine`.
- Docker local validation image build: pass with `node:20.19.0-alpine`; runs install, build, tests, smoke, determinism, and env parity.
- Drift search for relaxed lockfile and unpinned Node patterns: no matches.

## Residual Validation Risk

Local non-Docker pnpm validation did not run under Node `20.19.0` because the workstation active Node was `v22.16.0`. Docker builds validated the pinned Node runtime.

## Hosted Actions Note

GitHub Actions is not used as acceptance evidence. The local validation artifact is `artifacts/controls/local-validation/latest.json`.

## Compliance Audit Follow-Up

Additional commands:

```powershell
node --check scripts/controls/apply-branch-protection.mjs
node scripts/controls/apply-branch-protection.mjs --repo Mister-Nerdeus/commons-sim --branches staging,main --dry-run --enforce-admins
node scripts/controls/apply-branch-protection.mjs --repo Mister-Nerdeus/commons-sim --branches staging,main --enforce-admins
node scripts/controls/export-branch-protection.mjs --repo Mister-Nerdeus/commons-sim --branches develop,staging,main --operator codex-compliance-audit
node scripts/controls/export-environments.mjs --repo Mister-Nerdeus/commons-sim --operator codex-compliance-audit
node scripts/controls/apply-branch-protection.mjs --repo Mister-Nerdeus/commons-sim --branches develop,staging,main --enforce-admins --local-validation-only
pnpm env:parity:check
pnpm test
git diff --check
```

Results:

- Branch-protection apply script syntax check: pass.
- Branch-protection dry run: pass.
- `staging` branch protection apply: pass.
- `main` branch protection apply: pass.
- Branch-protection export: `develop`, `staging`, and `main` exported after live protection was applied.
- Required hosted status checks removed from live branch protection; local validation evidence is now the gate.
- Environment export: `dev`, `production`, and `staging` exported.
- Environment parity check: pass; local Node warning remains because the workstation runs Node `v22.16.0`.
- `pnpm test`: pass; local Node warning remains, and the server Postgres integration test remains skipped because `COMMONS_SIM_TEST_DATABASE_URL` is not set.
- `git diff --check`: pass; line-ending warnings only.
