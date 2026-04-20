# ADR-002: Engine Contract and Semantic Trust

## Status
Accepted

## Context
Engine logic was centralized and some schema inputs had no behavioral effect.

## Decision
- Decompose engine into submodels (`demand`, `labor`, `utilities`, `reserve`, `metrics`, `tiers`).
- Add semantic regression tests for reserve target, gas input, and burnout behavior.
- Add explicit output metadata version markers (`modelVersion`, `assumptionSetVersion`).

## Consequences
- Engine behavior is easier to audit and test.
- Output deltas are documented and versioned.
