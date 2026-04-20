# Sample Exported Report

# commons-sim comparison report

Baseline: baseline-48
Candidate: example-high-service
Model version: 1.1.0
Assumption set version: phase1-2026-04-19

## Metric deltas
- Avg Cost / Household: baseline=$231.20, candidate=$164.95, delta=$-66.25
- Avg Labor Hours / Month: baseline=321.5h, candidate=221.9h, delta=-99.7h
- Reserve End: baseline=$34184.47, candidate=$22395.44, delta=$-11789.03
- Avg Burnout Index: baseline=0.058, candidate=0.091, delta=+0.033

## Assumption warnings
- Candidate uses a higher gas therm price assumption.
- Candidate assumes higher labor overhead multiplier.
- Candidate targets a larger reserve buffer.

## Assumption registry
- wageModel.fullyLoadedUsdPerHour: baseline=29.5, candidate=30
- wageModel.overheadMultiplier: baseline=1.18, candidate=1.25
- utilities.gas_therm: baseline=1.5, candidate=1.6
- reservePolicy.targetMonthsOfOpex: baseline=3, candidate=4
- serviceTiers.meals: baseline=2, candidate=3
