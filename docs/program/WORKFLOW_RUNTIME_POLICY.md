# Workflow Runtime Policy

## Canonical Runtime

All workflows and Docker build images that run the Node workspace use the same runtime contract:

- Node: `20.19.0`
- pnpm: `9.0.0`
- Install command: `pnpm install --frozen-lockfile`
- Lockfile authority: `pnpm-lock.yaml`

The root `package.json` declares `packageManager: pnpm@9.0.0`. Workflows install pnpm through `pnpm/action-setup@v4` with `version: 9`; operators must not use a newer pnpm major without updating this policy and all workflow files in the same change.

## Lockfile Policy

CI, promotion, deploy, Pages, test, and determinism workflows must install with `--frozen-lockfile`. A workflow may not use `--frozen-lockfile=false` unless an exception is documented in this file with:

- workflow path
- reason
- owner
- expiration date
- compensating validation

There are no active exceptions.

## Runtime Parity Checklist

- [ ] `.github/workflows/ci.yml` uses Node `20.19.0`, pnpm `9`, and `pnpm install --frozen-lockfile`.
- [ ] `.github/workflows/determinism.yml` uses Node `20.19.0`, pnpm `9`, and `pnpm install --frozen-lockfile`.
- [ ] Promotion workflows use the same Node, pnpm, and frozen-lockfile policy as CI.
- [ ] Deploy workflows use the same Node, pnpm, and frozen-lockfile policy as CI.
- [ ] Docker build images use `node:20.19.0-alpine` and `pnpm@9.0.0`.
- [ ] Local setup docs instruct the same Node, pnpm, and frozen-lockfile install contract.

## Operator Notes

If a frozen-lockfile install fails, treat it as a dependency governance failure. Update dependencies locally, regenerate `pnpm-lock.yaml`, and commit the lockfile with the dependency change. Do not loosen workflow install integrity to unblock a promotion or deploy.
