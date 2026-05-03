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
| #31 Align required status checks | PASS | `artifacts/controls/required-check-map.json`, `docs/program/BRANCH_PROTECTION_POLICY.md`, RC and production checklists |
| #32 Normalize runtime/install parity | PASS | `docs/program/WORKFLOW_RUNTIME_POLICY.md`, workflow diffs, Dockerfile updates, `artifacts/batches/batch-11/runtime-version-inventory.md` |
| #33 Export live control evidence | PASS | Export scripts and artifacts exist; environments and protected branches export live |
| #34 Narrow staging reset truth claim | PASS | `docs/data/STAGING_RESET_CONTRACT.md`, updated scripts, baseline artifacts, reset verification log |
| #35 Batch 11 audit | PASS FOR CONTROL EVIDENCE, NO-GO FOR BATCH 12 HOSTED CI | This audit and `artifacts/batches/batch-11/*` |

## Required-Check Verification

All required check names now match workflow/job contexts:

- `ci / build_test_smoke`
- `dependency-review / dependency-review`
- `determinism / determinism`
- `promote-to-staging / validate_release_candidate`
- `release-prod / verify_production_release`

No docs now require shorthand names such as `ci`, `determinism`, or `release-prod`.

## Runtime Policy Verification

All workflows that run Node use Node `20.19.0`. All workflows that install pnpm dependencies use `pnpm install --frozen-lockfile`. Docker build/runtime images are pinned to `node:20.19.0-alpine`.

## Live Evidence Review

Live export artifacts were produced under `artifacts/controls/`.

Findings:

- Initial branch protection export returned `Branch not protected` for `develop`, `staging`, and `main`.
- `develop`, `staging`, and `main` branch protection were applied through `scripts/controls/apply-branch-protection.mjs` and re-exported successfully.
- Initial GitHub environment export returned only `dev`; `staging` and `production` were absent from live environment metadata.
- `staging` and `production` were created through the GitHub environments API and re-exported.

This is live enforcement drift, not a documentation ambiguity.

## Staging Reset Truth Review

The staging reset path is now explicitly metadata-only. The docs no longer claim full restore semantics. The script output includes `stateRestoreImplemented: false`.

## Validation Summary

Validation commands passed:

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test`
- `pnpm env:parity:check`
- `git diff --check`
- `docker build -f Dockerfile -t commons-sim:web-batch11 .`
- `docker build -f Dockerfile.api -t commons-sim:api-batch11 .`

Local pnpm commands emitted an expected warning because the workstation used Node `v22.16.0`; Docker validated Node `20.19.0`.

Post-push GitHub Actions runs were created for commit `ec7e873142d4ac4c95d78ee6bc3e7b3b48120b9a`, but jobs did not start. GitHub reported an account-level billing lock: `The job was not started because your account is locked due to a billing issue.`

## Residual Risks

See `artifacts/batches/batch-11/risk-register.md`.

## Go/No-Go Decision

NO-GO for Batch 12 module-contract work until hosted CI can run:

- resolve the GitHub Actions billing lock and re-run hosted checks
- decide whether `staging` and `production` need reviewer/wait-time protections beyond the now-created environment records
- re-run the live control exports and update `artifacts/controls/`
