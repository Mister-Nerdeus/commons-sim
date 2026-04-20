# Onboarding and Explainability

## Guided Planning Wizard

The web workspace includes a guided starter flow that creates valid projects from template IDs:

- `starter-balanced-24`
- `starter-family-48`
- `starter-lean-18`

Generator source: `packages/shared/src/planningWizard.ts`.

## Valid Project Guarantee

- Every starter template is validated by `ScenarioSchema` before use.
- Test coverage: `packages/shared/src/planningWizard.test.ts`.

## Explainability Layer

- Delta explanations are derived directly from output metric deltas:
  - `avgCostPerHouseholdUsd`
  - `avgLaborHoursPerMonth`
  - `reserveEndUsd`
  - `avgBurnoutIndex`
- Mapping source: `packages/shared/src/explainability.ts`.
- Test coverage: `packages/shared/src/explainability.test.ts`.

## Persistence Link

- Wizard outputs can be saved as project manifests in v1 contract format.
- Saved manifests can be loaded back into the workspace and simulated.
- Contract docs:
  - `docs/contracts/PROJECT_MANIFEST.md`
  - `docs/contracts/PROJECT_MIGRATIONS.md`
