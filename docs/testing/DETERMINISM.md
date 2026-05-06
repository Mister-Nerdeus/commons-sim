# Determinism

## Command Split
- `pnpm determinism:init`: local-only golden creation/update.
- `pnpm determinism:check`: verification-only check (no file writes).

Release validation must run only `pnpm determinism:check`; `pnpm determinism:init` is local-only golden creation/update.

## Golden Scenario Matrix
| ID | Scenario Input | Snapshot | Hash |
|---|---|---|---|
| `baseline-48` | `scenarios/baseline-48.json` | `scenarios/goldens/baseline-48.snapshot.json` | `scenarios/goldens/baseline-48.snapshot.sha256` |

## Golden Update Rules
1. Run `pnpm determinism:init` locally when output changes are intentional.
2. Review snapshot/hash diffs in PR.
3. Document reason for hash change in migration or semantic fix notes.
4. Local validation must still pass `pnpm determinism:check` after commit.

## Drift Failure Behavior
- `pnpm determinism:check` exits non-zero on hash mismatch or missing goldens.
- Negative drift assertion is covered by CLI test:
  - `packages/cli/src/determinism.test.ts` (`verifyHash throws on drift`).

## Local Validation Integration
- GitHub Actions is disabled for this project.
- Determinism step: `pnpm determinism:check`
