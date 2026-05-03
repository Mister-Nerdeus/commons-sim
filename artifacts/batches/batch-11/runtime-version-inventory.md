# Batch 11 Runtime Version Inventory

## Canonical Contract

- Node: `20.19.0`
- pnpm: `9.0.0`
- Install: `pnpm install --frozen-lockfile`
- Docker Node image: `node:20.19.0-alpine`

## Workflow Inventory

All Node/pnpm workflows now use Node `20.19.0`. All workflows that run pnpm install now use `pnpm install --frozen-lockfile`.

- `.github/workflows/ci.yml`
- `.github/workflows/determinism.yml`
- `.github/workflows/deploy-dev.yml`
- `.github/workflows/deploy-prod.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/pages.yml`
- `.github/workflows/promote-to-staging.yml`
- `.github/workflows/release-prod.yml`
- `.github/workflows/test.yml`

`.github/workflows/verify-env-parity.yml` now uses Node `20.19.0`; it does not install dependencies.

## Docker Inventory

- `Dockerfile`: build stage uses `node:20.19.0-alpine`.
- `Dockerfile.api`: build and runtime stages use `node:20.19.0-alpine`.
- Both Dockerfiles activate `pnpm@9.0.0`.

## Local Validation Caveat

Local validation was run with Node `v22.16.0`, so pnpm emitted the expected unsupported-engine warning for the root `20.x` engine. Docker validation exercised Node `20.19.0` directly.
