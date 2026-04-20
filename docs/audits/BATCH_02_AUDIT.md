# Batch 02 Audit

## Audit Metadata
- Batch: `batch-02`
- Audit issue: `#8`
- Audit date: 2026-04-19
- Auditor(s): Codex
- Scope (issues covered): #5, #6, #7
- Prior batch go/no-go reference: `docs/audits/BATCH_01_AUDIT.md`

## Gate Decision
- Status: `PASS`
- Next batch decision: `GO`
- Blocking reasons: none

## Claimed vs Observed Completion
| Issue | Claimed Complete | Observed Complete | Result (`PASS/FAIL`) | Evidence |
|---|---|---|---|---|
| #5 | Engine decomposed into auditable submodels with parity lock | `simulate.ts` is orchestration-only and submodels exist by responsibility; parity hash test added | PASS | `packages/engine/src/*`, `docs/model/ENGINE_SUBMODELS.md`, tests |
| #6 | Semantic defects reproduced and fixed with regression tests | Reserve target now active, gas input now active, burnout no longer collapsed; documented deltas | PASS | `docs/model/SEMANTIC_FIXES.md`, `packages/engine/src/semantic.test.ts` |
| #7 | Stable input/output product contract with versioned outputs | Contract docs added, output schema added, example fixtures validated, output meta version markers added | PASS | `docs/contracts/*`, `packages/shared/src/outputSchema.ts`, `packages/shared/src/contracts.test.ts` |

## Output Delta Review
- Declared deltas:
  - Deterministic baseline hash changed to `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`.
  - Reserve-end behavior changes under different reserve targets.
  - Burnout metric now non-zero under load.
  - Gas price now impacts utility cost.
- Unexplained deltas: none.

## Contract Integrity Review
- Input contract source of truth remains `ScenarioSchema`.
- Fixture validation suite confirms baseline + semantic fixtures validate.
- Output contract schema exists and engine output is validated against it.
- Output now includes explicit version markers (`modelVersion`, `assumptionSetVersion`) plus `engineVersion` for compatibility.

## Command Verification Log
| Command | Expected Result | Observed Result | Pass/Fail | Evidence |
|---|---|---|---|---|
| `pnpm build` | build success | passed | PASS | `artifacts/batches/batch-02/commands.md` |
| `pnpm test` | tests pass | passed | PASS | `artifacts/batches/batch-02/commands.md` |
| `pnpm smoke:cli` | baseline run succeeds | passed with hash output | PASS | `artifacts/batches/batch-02/commands.md` |
| `pnpm determinism:baseline` | deterministic check succeeds | passed with updated hash | PASS | `artifacts/batches/batch-02/commands.md` |

## Remaining Trust Risks
| Risk ID | Level | Owner | Note |
|---|---|---|---|
| R-201 Burnout heuristic calibration | Medium | Maintainer | formula is proxy pending model calibration |
| R-202 Gas therm coefficient calibration | Medium | Maintainer | coefficient is phase-1 approximation |
| R-203 Contract consumer migration | Low | Maintainer | downstream consumers must ingest new output meta fields |

## Reorder Recommendation (Change Control Input)
- Recommendation: `none`
- Proposed backlog change: none
- Dependency impact: none
- Evidence links: `artifacts/batches/batch-02/reorder.md`

## Evidence Index
- `artifacts/batches/batch-02/commands.md`
- `artifacts/batches/batch-02/files-changed.md`
- `artifacts/batches/batch-02/risks.md`
- `artifacts/batches/batch-02/reorder.md`
