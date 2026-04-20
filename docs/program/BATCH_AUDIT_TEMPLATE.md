# Batch Audit Template

Use this template for `docs/audits/BATCH_XX_AUDIT.md`.

## Audit Metadata
- Batch: `batch-XX`
- Audit issue: `#`
- Audit date:
- Auditor(s):
- Scope (issues covered):
- Prior batch go/no-go reference:

## Gate Decision
- Status: `PASS` | `FAIL`
- Next batch decision: `GO` | `NO-GO`
- Blocking reasons (required if fail):

## Claimed vs Observed Completion
| Issue | Claimed Complete | Observed Complete | Result (`PASS/FAIL`) | Evidence |
|---|---|---|---|---|
| # |  |  |  |  |

## Changed Files Summary
- Total files changed:
- Key files by issue:
- High-risk files touched:

## Command Verification Log
| Command | Expected Result | Observed Result | Pass/Fail | Evidence |
|---|---|---|---|---|
|  |  |  |  |  |

## Output/Behavior Delta Review
- Declared output changes:
- Observed output changes:
- Unexplained deltas (must be empty for pass):

## Risk Delta
| Risk ID | Previous Level | Current Level | Delta | Owner | Mitigation Date |
|---|---|---|---|---|---|
| R- |  |  |  |  |  |

## Reorder Recommendation (Change Control Input)
- Recommendation: `none` | `reorder` | `replace`
- Proposed backlog change:
- Why now:
- Dependency impact:
- Evidence links:

## Manual Settings Verification
- Branch protection/settings checks:
- Workflow/run IDs:
- External dependencies verified:

## Evidence Index
- `artifacts/batches/batch-XX/commands.md`
- `artifacts/batches/batch-XX/files-changed.md`
- `artifacts/batches/batch-XX/risks.md`
- `artifacts/batches/batch-XX/reorder.md`
- Additional evidence:

## Example Filled Stub (Abbreviated)
- Status: `PASS`
- Next batch decision: `GO`
- Sample issue result: `#1 PASS (governance docs complete and linked in README)`
- Sample risk delta: `R-001 Medium -> Low (control ambiguity reduced)`
- Sample reorder recommendation: `none`
