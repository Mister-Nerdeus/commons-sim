# Develop to Staging Promotion Contract

## Objective

Control promotion from integration branch (`develop`) into pre-production (`staging`) as a release-candidate (RC) event.

## Trigger and Approval Path

1. Create PR with source `develop` and target `staging`.
2. PR must pass required checks:
   - `ci / build_test_smoke`
   - `determinism / determinism`
   - `dependency-review / dependency-review`
   - `promote-to-staging / validate_release_candidate`
3. At least one code-owner approval required.
4. Merge only when RC evidence checklist is complete.

## Release Candidate Evidence Requirements

- Changelog summary of user-visible and model-visible changes.
- Determinism gate result.
- Scenario validation/benchmark references.
- Residual risk note with owner.
- Rollback readiness note.

Reference checklist: `docs/program/checklists/RC_CHECKLIST.md`.

## Rollback (Failed Staging Candidate)

- If RC fails in staging validation, revert `staging` to previous known-good commit.
- Open incident note with:
  - failed candidate SHA
  - failing checks or scenario outputs
  - rollback SHA and operator
- Re-run staging deploy workflow on rollback commit.

## Promotion Diagram

```mermaid
flowchart LR
  D[develop] -->|PR + RC evidence| S[staging]
  S -->|validation failed| R[rollback staging]
```
