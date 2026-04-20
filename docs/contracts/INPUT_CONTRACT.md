# Input Contract

Source of truth: `packages/shared/src/scenarioSchema.ts` (`ScenarioSchema`).

## Versioning
- `version`: literal `1` (required)

## Required Fields
- `id`, `title`
- `seed`, `horizonMonths`, `timestep`
- `householdCount`, `householdMix`, `occupantsPerType`
- `participation`, `serviceTiers`
- `wageModel`, `utilities`
- `equipment`
- `reservePolicy`

## Field Status (Implemented / Deprecated / Removed)
- Implemented and active:
  - `utilities.gas_therm` (used in utility cost model)
  - `reservePolicy.targetMonthsOfOpex` (used in reserve contribution policy)
- Fixed-value contract field:
  - `timestep` is currently constrained to `"month"` and not a free variable.
- No removed fields in v1 input schema.

## Validation Rules
- `householdMix.singles + couples + families == householdCount`
- Participation rates in `[0,1]`
- Tier values in `[0,3]` integers
- Numeric bounds enforced per field in schema

## Validated Example Fixtures
- `scenarios/baseline-48.json`
- `scenarios/semantic/reserve-target-low.json`
- `scenarios/semantic/reserve-target-high.json`
- `scenarios/semantic/gas-low.json`
- `scenarios/semantic/gas-high.json`

Validation coverage: `packages/shared/src/contracts.test.ts`.
