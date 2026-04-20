# Determinism

## Command Split
- `pnpm determinism:init`: local-only golden creation/update.
- `pnpm determinism:check`: verification-only check (no file writes).

CI must run only `pnpm determinism:check`.

## Golden Scenario Matrix
| ID | Scenario Input | Snapshot | Hash |
|---|---|---|---|
| `baseline-48` | `scenarios/baseline-48.json` | `scenarios/goldens/baseline-48.snapshot.json` | `scenarios/goldens/baseline-48.snapshot.sha256` |

## Golden Update Rules
1. Run `pnpm determinism:init` locally when output changes are intentional.
2. Review snapshot/hash diffs in PR.
3. Document reason for hash change in migration or semantic fix notes.
4. CI must still pass `pnpm determinism:check` after commit.

## Drift Failure Behavior
- `pnpm determinism:check` exits non-zero on hash mismatch or missing goldens.
- Negative drift assertion is covered by CLI test:
  - `packages/cli/src/determinism.test.ts` (`verifyHash throws on drift`).

## CI Integration
- Workflow: `.github/workflows/ci.yml`
- Determinism step: `pnpm determinism:check`
