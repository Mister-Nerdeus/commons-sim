# Batch 11 Runtime Version Inventory

## Canonical Contract

- Node: `20.19.0`
- pnpm: `9.0.0`
- Install: `pnpm install --frozen-lockfile`
- Docker Node image: `node:20.19.0-alpine`

## Local Validation Inventory

Release-grade local validation runs in `Dockerfile.local-validation` with Node `20.19.0`, pnpm `9.0.0`, and `pnpm install --frozen-lockfile`.

`scripts/controls/run-local-validation.mjs --include-docker` records a transcript and runs:

- host install/build/test/smoke/determinism/env-parity commands
- `Dockerfile.local-validation`
- web Docker build
- API Docker build

## Workflow Inventory

Workflows are retained as convenience automation only. They are not acceptance gates. All Node/pnpm workflows use Node `20.19.0`; all workflows that run pnpm install use `pnpm install --frozen-lockfile`.

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
