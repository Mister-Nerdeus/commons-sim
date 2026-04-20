# ADR-001: Runtime and Determinism Gate

## Status
Accepted

## Context
Local and CI runtime behavior drifted; determinism baseline creation and checking were conflated.

## Decision
- Pin Node to 20.x and pnpm to 9.x.
- Split determinism into `init` (local writes) and `check` (CI verification only).
- Commit golden files under `scenarios/goldens/`.

## Consequences
- CI can detect drift but cannot mutate baselines.
- Golden updates require explicit local action and committed evidence.
