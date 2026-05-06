# Local Automation Runtime Policy

## Canonical Runtime

All local validation and Docker build images that run the Node workspace use the same runtime contract. GitHub Actions is disabled for this project and must not be used as an automation or acceptance path.

- Node: `20.19.0`
- pnpm: `9.0.0`
- Install command: `pnpm install --frozen-lockfile`
- Lockfile authority: `pnpm-lock.yaml`

The root `package.json` declares `packageManager: pnpm@9.0.0`. Operators must not use a newer pnpm major without updating this policy and local validation evidence in the same change.

## Lockfile Policy

Local validation and Docker validation must install with `--frozen-lockfile`. A validation path may not use `--frozen-lockfile=false` unless an exception is documented in this file with:

- validation path
- reason
- owner
- expiration date
- compensating validation

There are no active exceptions.

## Runtime Parity Checklist

- [ ] `Dockerfile.local-validation` uses Node `20.19.0`, pnpm `9.0.0`, and `pnpm install --frozen-lockfile`.
- [ ] `scripts/controls/run-local-validation.mjs` runs the local validation map and writes evidence.
- [ ] GitHub Actions remains disabled in repository settings.
- [ ] Docker build images use `node:20.19.0-alpine` and `pnpm@9.0.0`.
- [ ] Local setup docs instruct the same Node, pnpm, and frozen-lockfile install contract.

## Operator Notes

If a frozen-lockfile install fails, treat it as a dependency governance failure. Update dependencies locally, regenerate `pnpm-lock.yaml`, and commit the lockfile with the dependency change. Do not loosen install integrity to unblock a promotion or deploy.
