# Batch Plan

## Batch Map
| Batch | Execution Issues | Audit Issue | Exit Gate |
|---|---|---|---|
| Batch 1 | #1, #2, #3 | #4 | Batch 1 audit pass required before Batch 2 |
| Batch 2 | #5, #6, #7 | #8 | Batch 2 audit pass required before Batch 3 |
| Batch 3 | #9, #10, #11 | #12 | Batch 3 audit pass required before Batch 4 |
| Batch 4 | #13, #14 | #15 | Batch 4 audit determines alpha readiness and next 15 |

## Governance Constraints
- Maximum of 3 execution issues before a mandatory audit.
- No issue from a later batch may start early.
- Audit issues are hard gates, not documentation-only tasks.

## Stop/Go Rule For Starting Next Batch
The next batch is `GO` only if all conditions are true:
1. Current batch audit status is `PASS`.
2. Audit includes evidence for commands, changed files, and output claims.
3. Any critical/high residual risk has explicit owner and mitigation due date.
4. Any reorder recommendation is approved and recorded through change control.

If any condition is false, status is `NO-GO` and only remediation work may proceed.

## Required Outputs Per Batch
- Issue-by-issue pass/fail matrix.
- Claimed vs observed completion check.
- Changed-files rollup.
- Risk delta and ranked residual risks.
- Explicit reorder recommendation (`none` allowed).
- Signed go/no-go decision for next batch.

## Evidence Directory Convention
- Batch-level artifacts: `artifacts/batches/batch-XX/`
- Required files in each batch directory:
  - `commands.md` (command transcripts or summarized logs)
  - `files-changed.md` (changed-files inventory)
  - `risks.md` (risk delta and ranking)
  - `reorder.md` (reorder recommendation and rationale)
  - additional evidence files as needed (screenshots, run IDs, exports)
