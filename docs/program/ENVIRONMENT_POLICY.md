# Environment Policy

## Purpose

Define explicit branch-to-environment deployment authority and control points.

## Environment Authority Mapping

| Environment | Source Branch | Deployment Workflow | Authority |
|---|---|---|---|
| `dev` | `develop` | `.github/workflows/deploy-dev.yml` | integration validation |
| `staging` | `staging` | `.github/workflows/deploy-staging.yml` | release-candidate validation |
| `production` | `main` | `.github/workflows/deploy-prod.yml` | live release authority |

## Deployment Branch Rules

- `dev` environment allows deployments from `develop` only.
- `staging` environment allows deployments from `staging` only.
- `production` environment allows deployments from `main` only.

GitHub environment branch restrictions and required reviewers must be configured manually in repository settings.

## Secrets and Config Separation Matrix

| Class | `dev` | `staging` | `production` |
|---|---|---|---|
| API keys | sandbox keys | staging keys | production keys |
| External integrations | mocked/non-critical | pre-prod integrations | production integrations |
| Data stores | dev dataset | staging baseline snapshot | production dataset |
| Rotation policy | quarterly | monthly | monthly + emergency rotation |

## Staging Data Policy Anchor

- Staging baseline source is the `main`-derived cutover baseline.
- Staging resets and refreshes must follow versioned runbook procedures.
- Authoritative policy artifacts:
  - `docs/data/STAGING_DATA_POLICY.md`
  - `docs/data/STAGING_REFRESH_RUNBOOK.md`

## Manual Environment Settings Checklist

1. Create GitHub environments: `dev`, `staging`, `production`.
2. Set deployment branch restrictions exactly to `develop`, `staging`, `main` respectively.
3. Set environment-specific secrets and variables with no cross-environment reuse.
4. Set required reviewers for `staging` and `production`.
5. Record screenshots/exports in `artifacts/batches/batch-05/`.
