# Issue 17/18 CI and Check Mapping

## Canonical Required Status Checks

- `ci / build_test_smoke` from `.github/workflows/ci.yml`
- `dependency-review / dependency-review` from `.github/workflows/dependency-review.yml`
- `determinism / determinism` from `.github/workflows/determinism.yml`

## Deployment Workflow to Environment Mapping

- `.github/workflows/deploy-dev.yml` -> `dev` (branch: `develop`)
- `.github/workflows/deploy-staging.yml` -> `staging` (branch: `staging`)
- `.github/workflows/deploy-prod.yml` -> `production` (branch: `main`)
