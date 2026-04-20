# Top 15 Locked Backlog

This document is the locked execution backlog for the first 15 issues. Work order is fixed unless changed through an approved audit artifact under `artifacts/batches/` and documented in `docs/program/CHANGE_CONTROL.md`.

## Program Invariants
- No issue starts without an explicit issue contract.
- A batch may contain at most 3 execution issues before an audit issue.
- No next batch may begin until the prior audit passes.
- Audits must compare claimed completion vs observed completion.
- Backlog reorder may only happen through an audit artifact.
- Every issue must define required outputs and closeout evidence.

## Ordered Issue List With Rationale
1. Issue #1 - Establish Program Control, Batch Governance, and Audit Contract  
   Rationale: Foundational control layer; prevents drift and establishes enforcement before feature work.
2. Issue #2 - Normalize Runtime, Toolchain, and Install Reproducibility  
   Rationale: Makes local and CI behavior consistent so later verification is trustworthy.
3. Issue #3 - Harden CI, Branch Protection, and Repo Governance  
   Rationale: Enforces repo-level control and required checks before deeper implementation changes.
4. Issue #4 - Batch 1 Audit: Governance, Toolchain, and CI Verification  
   Rationale: Immediate validation gate before any engine-level refactor work.
5. Issue #5 - Decompose the Simulation Engine into Auditable Submodels  
   Rationale: Structural precondition for safe semantic fixes.
6. Issue #6 - Reproduce and Repair Model Semantic Defects  
   Rationale: Correctness work follows structure so fixes are reviewable and testable.
7. Issue #7 - Convert the Schema into a Stable Product Contract  
   Rationale: Locks external contracts once core behavior and semantics are stabilized.
8. Issue #8 - Batch 2 Audit: Engine Structure, Semantic Trust, and Contract Integrity  
   Rationale: Trust gate for architecture and behavior before determinism hardening.
9. Issue #9 - Split Determinism into Local Init vs CI Check and Commit Goldens  
   Rationale: Prevents CI baseline mutation and establishes drift detection.
10. Issue #10 - Expand Tests and Add Coverage Gates for Engine, Shared, and CLI  
   Rationale: Builds confidence with measurable coverage and critical-path tests.
11. Issue #11 - Harden the CLI and Scenario Fixture Workflow  
   Rationale: Stabilizes operator workflows and integration surfaces.
12. Issue #12 - Batch 3 Audit: Determinism, Tests, and CLI Reliability  
   Rationale: Reliability gate before user-facing product work.
13. Issue #13 - Build a Comparison-First Web Workspace for Scenario Decisions  
   Rationale: First major user-facing surface after reliability controls are in place.
14. Issue #14 - Add Assumptions Transparency, Exportable Reports, and ADR/Doc Pack  
   Rationale: Adds transparency, reporting, and architectural traceability for trust.
15. Issue #15 - Batch 4 Audit and Alpha Readiness Reorder of the Next 15  
   Rationale: Final audit and evidence-driven reprioritization for the next phase.

## Lock Rule
This backlog is immutable unless an audit explicitly recommends and approves reordering per `docs/program/CHANGE_CONTROL.md`.
