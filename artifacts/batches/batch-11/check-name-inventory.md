# Batch 11 Validation-Name Inventory

## Before

Docs used mixed shorthand and exact GitHub Actions contexts:

- Branch policy exact contexts: `ci / build_test_smoke`, `dependency-review / dependency-review`, `determinism / determinism`.
- RC checklist shorthand: `ci`, `determinism`, `dependency-review`.
- Production checklist shorthand plus implied production gate: `ci`, `determinism`, `dependency-review`, `release-prod`.

## Current Local Gate

GitHub Actions is not used as a required gate. The canonical map is:

- `artifacts/controls/required-check-map.json`: declares `githubStatusChecksRequired: false`.
- `artifacts/controls/local-required-check-map.json`: declares required local validation commands.
- `artifacts/controls/local-validation/latest.json`: records the most recent local validation transcript.

Required local checks:

- `docker build -f Dockerfile.local-validation -t commons-sim:local-validation .`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test`
- `pnpm smoke:cli`
- `pnpm determinism:check`
- `pnpm env:parity:check`

## Determinism Representation

Determinism is represented by local command `pnpm determinism:check` and by `Dockerfile.local-validation`, which runs determinism under Node `20.19.0`.

## Hosted Workflow Note

GitHub Actions workflows may remain in the repository as convenience automation, but protected branch policy and release approval do not depend on hosted workflow status contexts.
