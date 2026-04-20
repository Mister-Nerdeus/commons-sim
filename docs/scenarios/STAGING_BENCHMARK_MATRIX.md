# Staging Benchmark Matrix

## Objective

Define canonical scenario checks required for staging release-candidate validation.

## Matrix

| Scenario ID | Primary Signal | Secondary Signal | Gate |
|---|---|---|---|
| `cn-001-balanced-48` | `avgCostPerHouseholdUsd` | `avgBurnoutIndex` | must remain within approved delta threshold |
| `cn-002-family-heavy-64` | `avgLaborHoursPerMonth` | `reserveEndUsd` | must remain within approved delta threshold |
| `cn-003-lean-service-36` | `reserveEndUsd` | `avgCostPerHouseholdUsd` | must remain within approved delta threshold |

## Benchmark Artifact

- Canonical benchmark output is versioned in:
  - `artifacts/scenarios/canonical-benchmark-results.json`
- Regenerate after output-affecting changes:

```powershell
pnpm build
node scripts/scenarios/generate-canonical-benchmarks.mjs
```

## Staging Validation Mapping

- RC promotions (`develop` -> `staging`) must attach benchmark diff against current canonical results.
- Production promotions (`staging` -> `main`) must confirm no unresolved benchmark drift.
