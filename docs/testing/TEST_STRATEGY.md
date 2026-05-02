# Test Strategy

## Test Matrix
| Package | Test Types | Key Focus |
|---|---|---|
| `@commons-sim/engine` | Unit + semantic regression + parity hash | equations, semantic defect lock, deterministic parity |
| `@commons-sim/shared` | Schema validation + negative validation + fixture contract tests | input contract integrity |
| `@commons-sim/cli` | unit + integration smoke/error path + determinism drift assertion | command behavior and automation stability |
| `@commons-sim/web` | typecheck gate + production build in root build | challenge UI contract integrity and build path |
| `@commons-sim/server` | HTTP integration + file-backed storage tests | signed identity, server-side scoring, rate limits, seasons, review workflow, and leaderboard behavior |

## Coverage Policy
Coverage thresholds are enforced in package test commands (CI-enforced):
- Engine: lines/functions/statements >= 65%, branches >= 55%
- Shared: lines/functions/statements >= 60%, branches >= 50%
- CLI: lines/statements >= 60%, functions >= 45%, branches >= 50%
- Server: lines/functions/statements >= 60%, branches >= 50%
- Web: typecheck is enforced through package test; production build is enforced through root build.

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
  - challenge-score and challenge-batch emit deterministic challenge results
- Web behavior:
  - TypeScript validates challenge benchmark wiring and UI contracts
- Server behavior:
  - health and benchmark listing work
  - valid submissions are re-simulated and stored
  - locked-field violations return validation failure instead of leaderboard acceptance
  - unsigned submissions are rejected
  - finalist review and season creation require admin flow
  - protected write endpoints are rate limited

## CI Integration
- Workflow: `.github/workflows/ci.yml`
- `pnpm test` runs package-level coverage gates and fails CI on threshold breaches.
