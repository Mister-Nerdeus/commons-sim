# Staging Data Policy

## Policy Intent

Staging data posture must be reproducible, intentional, and anchored to the baseline created from the `main`-derived staging cutover.

## Baseline Source

- Branch baseline source: `main` SHA `ed51496b3a37d9a8094d6ad2a7c4f13d3bb21488` (staging cutover).
- Baseline artifact location: `artifacts/data/staging-baseline/`.
- Baseline record file: `artifacts/data/staging-baseline/baseline-record.json`.

## Data Rules

- Staging data is never ad hoc.
- Refreshes must be operator-triggered and documented.
- Baseline refresh must update artifact record and operator log.
- Production data must not be copied into staging without explicit scrub policy approval.

## Reproducibility Contract

- Seed/snapshot scripts are versioned in `scripts/data/`.
- Refresh operations must produce deterministic record files.
- Every reset/refresh must include timestamp, operator, source SHA, and reason.

## Prohibited States

- Unknown data origin in staging.
- Manual edits with no artifact record.
- Silent refreshes without runbook execution log.
