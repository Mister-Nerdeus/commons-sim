# Semantic Fixes (Issue #6)

## Defect Log

### DEF-001: `targetMonthsOfOpex` computed but ignored
- Symptom: changing reserve target did not change reserve outcomes.
- Reproduction (before fix):
  - `reserve_end_low=58293.39198798014`
  - `reserve_end_high=58293.39198798014`
  - `reserve_equal=true`
- Fix: reserve contribution now uses `gapToTargetUsd` so reserve accumulation is bounded by target gap.
- Regression test: `packages/engine/src/semantic.test.ts` (`reserve target months influences reserve trajectory`).

### DEF-002: `burnoutIndex` collapsed to zero
- Symptom: burnout stayed `0` despite workload changes.
- Reproduction (before fix): `burnout_sample=[0,0,0]`.
- Fix: burnout now measures overload against a household-scaled sustainable capacity band.
- Regression test: `packages/engine/src/semantic.test.ts` (`burnout index increases under high workload`).

### DEF-003: `utilities.gas_therm` was a dead input
- Symptom: changing `gas_therm` had no effect on costs.
- Reproduction (before fix): `gas_equal=true`.
- Fix: gas therm consumption proxy added and multiplied by `gas_therm` unit price in utility cost.
- Regression test: `packages/engine/src/semantic.test.ts` (`gas_therm utility price affects total cost`).

## Output Delta Summary

Baseline scenario (`scenarios/baseline-48.json`) changed as expected after semantic fixes.

- Previous baseline hash: `695be456953c6cc19d822437413d33089ee30b54105430178a96365389dcf5dd`
- New baseline hash: `3ca9862b42535fc7864d955e3e33c5a851037a13fc500a4ef17b2468d957f444`

Observed behavioral deltas:
- Reserve policy now responds to `targetMonthsOfOpex`:
  - low target reserve end: `25000`
  - high target reserve end: `58293.39198798014`
- Burnout is now non-zero under load (example sample):
  - `[0.05059466943501819, 0.050782479493955236, 0.07167617709588628]`
- Gas utility price now changes costs:
  - gas low average cost per household: `231.20411102763958`
  - gas high average cost per household: `268.8916110276396`

## Remaining Uncertain Areas
- Gas therm consumption coefficient is a phase-1 proxy and should be calibrated with domain data.
- Burnout proxy is heuristic; future revisions should connect to staffing targets or service-level expectations.
