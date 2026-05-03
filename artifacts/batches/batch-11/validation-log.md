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
