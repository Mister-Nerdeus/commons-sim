# Environment Parity Gates

## Purpose

Detect drift across `develop`, `staging`, and `main` in three dimensions:

1. Config mapping drift
2. Schema/version drift
3. Seed/data-contract drift

## Drift Categories

| Category | Allowed Drift | Forbidden Drift | Gate Action |
|---|---|---|---|
| Config | environment-specific secrets only | branch-to-environment remap | fail |
| Schema | backward-compatible staged migration | unversioned breaking schema change | fail |
| Seed/data contract | documented baseline refresh | undocumented staging data origin | fail |

## Gate Implementation

- Workflow: `.github/workflows/verify-env-parity.yml`
- Script: `scripts/parity/verify-env-parity.mjs`
- Optional seed check: `scripts/parity/verify-seed-contract.mjs`

## Enforcement

- Gate runs on PR and push for `develop`, `staging`, and `main`.
- Parity failures block promotion PRs.
- Intentional drift requires explicit policy note and a follow-up remediation issue.

## Intentional Drift Test (Documented Example)

If `deploy-staging.yml` environment is changed from `staging` to another value, parity script must fail with a branch/environment mismatch error.
