# Environment Policy

## Purpose

Define explicit branch-to-environment authority and control points. GitHub Actions is disabled for this project; environment promotion is a manual/local operation backed by local validation evidence.

## Environment Authority Mapping

| Environment | Source Branch | Promotion Mechanism | Authority |
|---|---|---|---|
| `dev` | `develop` | manual/local deployment record | integration validation |
| `staging` | `staging` | manual/local release-candidate record | release-candidate validation |
| `production` | `main` | manual/local production release record | live release authority |

## Deployment Branch Rules

- `dev` environment allows deployments from `develop` only.
- `staging` environment allows deployments from `staging` only.
- `production` environment allows deployments from `main` only.

GitHub environment branch restrictions and required reviewers may be configured manually in repository settings, but no hosted Actions workflow is part of the gate.

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
6. Keep GitHub Actions disabled in repository settings.
