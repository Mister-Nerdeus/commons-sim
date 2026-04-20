# Change Control

This document defines how backlog order may change after lock.

## Core Rule
Backlog reorder or replacement is allowed only through an approved audit artifact and never through ad hoc issue edits.

## Allowed Change Types
1. `reorder`: Change execution sequence of existing issues.
2. `replace`: Swap one issue with a scoped equivalent issue.
3. `split`: Split one issue into smaller issues without bypassing audit cadence.
4. `merge`: Combine issues when dependencies are proven redundant.

## Required Inputs
All change proposals must include:
- Current issue order and proposed order.
- Dependency impact analysis.
- Risk impact (what risk is reduced, transferred, or increased).
- Evidence links from latest batch artifacts.
- Explicit statement of unaffected acceptance gates.

## Approval Workflow
1. Proposal is written in current batch audit under `Reorder Recommendation`.
2. Proposal details are stored at `artifacts/batches/batch-XX/reorder.md`.
3. Maintainer decision is recorded in the same audit (`approved` or `rejected`).
4. If approved, update:
   - `docs/program/TOP_15_BACKLOG.md` (or `NEXT_15_BACKLOG.md` after Issue #15)
   - `docs/program/BATCH_PLAN.md`
   - `docs/program/DEPENDENCY_MAP.md`
5. Link the approving audit in commit message and PR description.

## Prohibited Changes
- Starting a next-batch issue before prior audit pass.
- Reordering due to preference without dependency/risk evidence.
- Silent replacement that changes scope without migration/impact notes.
- Skipping an audit issue.

## Stop/Go Enforcement
A batch start is invalid until prior audit explicitly marks `GO`.
Any work performed without a valid `GO` is non-compliant and must be re-audited.

## Evidence Directory Convention
- Batch artifact root: `artifacts/batches/batch-XX/`
- Reorder evidence file: `artifacts/batches/batch-XX/reorder.md`
- Audit decision record: `docs/audits/BATCH_XX_AUDIT.md`
