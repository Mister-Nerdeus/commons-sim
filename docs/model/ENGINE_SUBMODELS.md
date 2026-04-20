# Engine Submodel Architecture (Issue #5)

## Module Tree
- `packages/engine/src/simulate.ts`: orchestration only
- `packages/engine/src/tiers.ts`: service-tier to demand coefficients
- `packages/engine/src/demand.ts`: participation-adjusted monthly demand quantities
- `packages/engine/src/labor.ts`: labor hours and labor cost equations
- `packages/engine/src/utilities.ts`: utility usage and utility cost equations
- `packages/engine/src/reserve.ts`: equipment monthly cost + reserve policy transitions
- `packages/engine/src/metrics.ts`: burnout index and summary aggregation
- `packages/engine/src/model.ts`: shared output types and resident-count derivation

## Responsibility Boundaries
- Tiering logic is isolated from monthly demand computation.
- Demand quantities are isolated from labor and utility cost calculations.
- Reserve and equipment logic are isolated from demand/labor/utilities.
- Summary/metrics logic is isolated from per-month model calculations.
- `simulateScenario` coordinates all submodels and assembles outputs.

## Parity Scope
This refactor is structural only. Behavioral parity is enforced with:
- deterministic scenario equality test (`packages/engine/src/test.ts`)
- baseline parity hash test (`packages/engine/src/submodels.test.ts`)

Expected baseline hash for current semantic scope:
- `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`
