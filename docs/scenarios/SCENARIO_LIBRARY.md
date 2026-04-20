# Canonical Scenario Library

## Purpose

Provide a stable, versioned scenario set for staging validation and release-candidate comparison.

## Canonical Scenario Set

| Scenario ID | File | Validation Use |
|---|---|---|
| `cn-001-balanced-48` | `examples/scenarios/canonical/cn-001-balanced-48.json` | baseline operating profile |
| `cn-002-family-heavy-64` | `examples/scenarios/canonical/cn-002-family-heavy-64.json` | high-demand family-heavy profile |
| `cn-003-lean-service-36` | `examples/scenarios/canonical/cn-003-lean-service-36.json` | low-intensity service profile |

## Stability Contract

- Scenario IDs are stable and must not be reused.
- Any edits require changelog note and benchmark re-generation.
- New scenarios must include rationale and staging validation mapping.

## Fixture References

- CLI fixture validation test: `packages/cli/src/canonical.test.ts`
- Benchmark artifact generator: `scripts/scenarios/generate-canonical-benchmarks.mjs`
- Benchmark artifact output: `artifacts/scenarios/canonical-benchmark-results.json`
