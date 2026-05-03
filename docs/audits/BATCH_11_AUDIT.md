# Batch 11 Audit: Control-Plane Readiness For Module Expansion

## Scope

Batch 11 covers Issues #31-#35:

- required-check context alignment
- runtime/install parity
- live control evidence export
- staging reset truthfulness
- control-plane go/no-go decision

## Pass/Fail Table

| Issue | Result | Evidence |
| --- | --- | --- |
| #31 Align required checks | PASS | `artifacts/controls/required-check-map.json`, `artifacts/controls/local-required-check-map.json`, `docs/program/BRANCH_PROTECTION_POLICY.md`, RC and production checklists |
| #32 Normalize runtime/install parity | PASS | `docs/program/WORKFLOW_RUNTIME_POLICY.md`, workflow diffs, Dockerfile updates, `artifacts/batches/batch-11/runtime-version-inventory.md` |
| #33 Export live control evidence | PASS | Export scripts and artifacts exist; environments and protected branches export live |
| #34 Narrow staging reset truth claim | PASS | `docs/data/STAGING_RESET_CONTRACT.md`, updated scripts, baseline artifacts, reset verification log |
| #35 Batch 11 audit | PASS / GO FOR BATCH 12 LOCAL WORK | This audit and `artifacts/batches/batch-11/*` |

## Required-Check Verification

GitHub Actions is not a required gate. The required-check map now declares `githubStatusChecksRequired: false`, and protected branch settings do not require hosted status checks.

Required local checks are versioned in `artifacts/controls/local-required-check-map.json`, with evidence in `artifacts/controls/local-validation/latest.json`.

## Runtime Policy Verification

Local validation Docker images use Node `20.19.0`. All local validation paths install with `pnpm install --frozen-lockfile`. Docker build/runtime images are pinned to `node:20.19.0-alpine`.

## Live Evidence Review

Live export artifacts were produced under `artifacts/controls/`.

Findings:

- Initial branch protection export returned `Branch not protected` for `develop`, `staging`, and `main`.
- `develop`, `staging`, and `main` branch protection were applied through `scripts/controls/apply-branch-protection.mjs` and re-exported successfully.
- Required GitHub status checks were removed from live branch protection in favor of local validation artifacts.
- Initial GitHub environment export returned only `dev`; `staging` and `production` were absent from live environment metadata.
- `staging` and `production` were created through the GitHub environments API and re-exported.

This is live enforcement drift, not a documentation ambiguity.

## Staging Reset Truth Review

The staging reset path is now explicitly metadata-only. The docs no longer claim full restore semantics. The script output includes `stateRestoreImplemented: false`.

## Validation Summary

Validation commands passed:

- `node scripts/controls/run-local-validation.mjs --operator codex-local-validation --include-docker`
- `docker build -f Dockerfile.local-validation -t commons-sim:local-validation .`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test`
- `pnpm env:parity:check`
- `git diff --check`
- `docker build -f Dockerfile -t commons-sim:web-batch11 .`
- `docker build -f Dockerfile.api -t commons-sim:api-batch11 .`

Local pnpm commands emitted an expected warning because the workstation used Node `v22.16.0`; Docker validated Node `20.19.0`.

Hosted GitHub Actions are not considered acceptance evidence.

## Residual Risks

See `artifacts/batches/batch-11/risk-register.md`.

## Go/No-Go Decision

GO for Batch 12 local module-contract work.

Required operating constraint: every batch must produce local validation evidence before audit closeout.
