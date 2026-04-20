# Dependency Map (Issues #1-#15)

## Dependency Table
| Issue | Depends On | Enables | Notes |
|---|---|---|---|
| #1 | none | #2, #3, #4, all future governance | Establishes execution contract and control primitives |
| #2 | #1 | #3, #4, #5+ | Runtime/toolchain baseline needed for reproducible verification |
| #3 | #1, #2 | #4 and all future gated delivery | CI and branch policy enforcement |
| #4 | #1, #2, #3 | #5, #6, #7, #8 | Batch 1 audit gate |
| #5 | #4 | #6, #8 | Structural engine decomposition precondition |
| #6 | #5 | #7, #8, #9+ | Semantic correctness before contracts/determinism hardening |
| #7 | #5, #6 | #8, #9, #10, #11 | Stable input/output contract for downstream tests/CLI/UI |
| #8 | #5, #6, #7 | #9, #10, #11, #12 | Batch 2 trust gate |
| #9 | #8 | #10, #12 | Determinism gate and golden-policy split |
| #10 | #8, #9 | #11, #12 | Coverage and reliability foundations |
| #11 | #7, #9, #10 | #12, #13, #14 | Stable CLI workflow for audit and users |
| #12 | #9, #10, #11 | #13, #14, #15 | Batch 3 reliability gate |
| #13 | #12 | #14, #15 | Comparison-first user-facing workspace |
| #14 | #12, #13 | #15 | Transparency, exports, and ADR pack |
| #15 | #13, #14 and all prior audits | Next program cycle | Final alpha readiness audit and reorder |

## Critical Path
#1 -> #2 -> #3 -> #4 -> #5 -> #6 -> #7 -> #8 -> #9 -> #10 -> #11 -> #12 -> #13 -> #14 -> #15

## Parallelism Rules
- Parallel work is allowed only within the same batch and only when dependency edges are not violated.
- Audit issues (#4, #8, #12, #15) block all subsequent batch starts until pass.
