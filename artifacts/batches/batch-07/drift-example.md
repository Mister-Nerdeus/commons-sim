# Intentional Drift Example

## Test Case

Change `.github/workflows/deploy-staging.yml` environment from `staging` to any other value.

## Expected Result

`node scripts/parity/verify-env-parity.mjs` fails with:

- `ok=false`
- failed check for `.github/workflows/deploy-staging.yml`
- `hasEnvironment=false`

## Policy Mapping

This validates forbidden config drift behavior defined in `docs/gates/ENV_PARITY_GATES.md`.
