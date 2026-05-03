# Batch 11 Check-Name Inventory

## Before

Docs used mixed shorthand and exact contexts:

- Branch policy exact contexts: `ci / build_test_smoke`, `dependency-review / dependency-review`, `determinism / determinism`.
- RC checklist shorthand: `ci`, `determinism`, `dependency-review`.
- Production checklist shorthand plus implied production gate: `ci`, `determinism`, `dependency-review`, `release-prod`.
- Runtime workflows used mixed Node/install settings: CI used Node `20.19.0` and frozen lockfile; determinism, promotion, deploy, and test workflows used Node `20` and several used `--frozen-lockfile=false`.

## After

Canonical required-check map:

- `develop`: `ci / build_test_smoke`, `determinism / determinism`
- `staging`: `ci / build_test_smoke`, `dependency-review / dependency-review`, `determinism / determinism`, `promote-to-staging / validate_release_candidate`
- `main`: `ci / build_test_smoke`, `dependency-review / dependency-review`, `determinism / determinism`, `release-prod / verify_production_release`

Machine-produced workflow/job contexts represented in `artifacts/controls/required-check-map.json`:

- `api-container / build_api_container`
- `ci / build_test_smoke`
- `dependency-review / dependency-review`
- `deploy-dev / deploy_dev`
- `deploy-prod / deploy_prod`
- `deploy-staging / deploy_staging`
- `determinism / determinism`
- `pages / deploy`
- `promote-to-staging / validate_release_candidate`
- `release-prod / verify_production_release`
- `test / test`
- `verify-env-parity / parity`

Determinism is explicitly represented as the standalone context `determinism / determinism`; CI also runs `pnpm determinism:check` inside `ci / build_test_smoke`.

## Example CI Context List

For commit `a459f2a6a60c26ee64c5795470806320df7f42e2` on `develop`, GitHub reported these workflow runs before this batch commit:

- `api-container`: completed, failure
- `test`: completed, failure
- `deploy-dev`: completed, failure
- `verify-env-parity`: completed, failure
- `ci`: completed, failure
- `determinism`: completed, failure

The Batch 11 changes normalize runtime/install behavior that was a likely contributor to workflow drift.
