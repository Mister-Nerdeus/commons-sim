# Output Contract

Primary output type: `SimOutputs` in `packages/engine/src/model.ts`.
Output schema mirror: `SimulationOutputSchema` in `packages/shared/src/outputSchema.ts`.

## Output Shape
- `scenarioId: string`
- `horizonMonths: number`
- `summary`:
  - `avgCostPerHouseholdUsd`
  - `avgLaborHoursPerMonth`
  - `reserveEndUsd`
  - `avgBurnoutIndex`
- `series[]` points:
  - `monthIndex`
  - `totalOpexUsd`
  - `laborHours`
  - `reserveUsd`
  - `costPerHouseholdUsd`
  - `burnoutIndex`
- `meta`:
  - `modelVersion`
  - `assumptionSetVersion`
  - `engineVersion`
  - `seed`

## Versioning Policy
- `meta.modelVersion`: model behavior contract version.
- `meta.assumptionSetVersion`: assumption set release identifier.
- `meta.engineVersion`: engine implementation version (backward-compatibility marker).

Any behavior-changing release must update at least one of:
- `modelVersion`
- `assumptionSetVersion`

## Validation
Engine tests validate output against shared schema:
- `packages/engine/src/test.ts`
