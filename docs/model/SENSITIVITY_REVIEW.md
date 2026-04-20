# Sensitivity Review for Staging RC

## Purpose

Sensitivity analysis is a required staging review signal for release candidates.

## Command

```powershell
pnpm --filter @commons-sim/cli build
node packages/cli/dist/main.js sensitivity examples/scenarios/canonical/cn-001-balanced-48.json
```

## Deterministic Contract

- Same scenario + same seed => identical sensitivity output.
- Perturbation set is fixed by default (`-10%`, `+10%`) for:
  - wage rate
  - utility price vector
  - participation rates

## Interpretation Rules

- Large swings in `avgCostPerHouseholdUsd` or `reserveEndUsd` require explicit risk note.
- RC comparison should track whether sensitivity envelopes expand versus prior candidate.
- Sensitivity does not replace canonical benchmark checks; it complements them.

## Evidence Requirements

- Attach sensitivity output artifact for each canonical scenario in RC review.
- Include baseline-to-candidate comparison summary in PR evidence.
