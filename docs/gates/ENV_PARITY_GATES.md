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

- Script: `scripts/parity/verify-env-parity.mjs`
- Optional seed check: `scripts/parity/verify-seed-contract.mjs`
- Environment evidence: `artifacts/controls/environments/*.json`

## Enforcement

- GitHub Actions is disabled for this project.
- Operators run `pnpm env:parity:check` locally before promotion PR approval.
- Parity failures block promotion PR approval.
- Intentional drift requires explicit policy note and a follow-up remediation issue.

## Intentional Drift Test (Documented Example)

If `artifacts/controls/environments/staging.json` no longer exports the `staging` environment, parity script must fail with an environment mismatch error.
