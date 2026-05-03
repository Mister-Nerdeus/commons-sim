# Batch 11 Validation Log

## Commands

```powershell
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
- Drift search for relaxed lockfile and unpinned Node patterns: no matches.

## Residual Validation Risk

Local non-Docker pnpm validation did not run under Node `20.19.0` because the workstation active Node was `v22.16.0`. Docker builds validated the pinned Node runtime.

## Post-Push CI Evidence

After pushing commit `ec7e873142d4ac4c95d78ee6bc3e7b3b48120b9a`, GitHub created workflow runs for `ci`, `determinism`, `test`, `verify-env-parity`, `deploy-dev`, and `api-container`, but jobs failed before any steps ran.

The check annotation for `ci / build_test_smoke` reported: `The job was not started because your account is locked due to a billing issue.`

This is an account-level Actions execution blocker. It does not contradict the local or Docker validation results above.
