# Test Strategy

## Test Matrix
| Package | Test Types | Key Focus |
|---|---|---|
| `@commons-sim/engine` | Unit + semantic regression + parity hash | equations, semantic defect lock, deterministic parity |
| `@commons-sim/shared` | Schema validation + negative validation + fixture contract tests | input contract integrity |
| `@commons-sim/cli` | unit + integration smoke/error path + determinism drift assertion | command behavior and automation stability |
| `@commons-sim/web` | placeholder smoke (no coverage gate yet) | build path only |

## Coverage Policy
Coverage thresholds are enforced in package test commands (CI-enforced):
- Engine: lines/functions/statements >= 65%, branches >= 55%
- Shared: lines/functions/statements >= 60%, branches >= 50%
- CLI: lines/statements >= 60%, functions >= 45%, branches >= 50%

Threshold enforcement is non-advisory via `c8 --check-coverage`.

## Critical Assertions
- Engine semantic regressions:
  - reserve target impact
  - gas utility input impact
  - burnout metric non-collapse
- Shared validation:
  - schema accepts valid fixtures
  - schema rejects invalid household mix
- CLI behavior:
  - baseline scenario run succeeds
  - missing scenario path fails with stable non-zero behavior
  - deterministic drift detection throws

## CI Integration
- Workflow: `.github/workflows/ci.yml`
- `pnpm test` runs package-level coverage gates and fails CI on threshold breaches.
