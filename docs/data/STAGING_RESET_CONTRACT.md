# Staging Reset Contract

## Current Contract

The staging reset tooling is a metadata-only provenance contract. It records:

- baseline name
- source branch and source SHA
- capture timestamp and operator
- reset evidence timestamp and operator
- reset reason

It does not restore database records, object storage, uploaded files, environment variables, deployment state, or third-party service state.

## Script Behavior

- `scripts/data/capture-staging-baseline.mjs` writes `artifacts/data/staging-baseline/baseline-record.json`.
- `scripts/data/reset-staging-from-baseline.mjs` appends a reset evidence entry to `artifacts/data/staging-baseline/reset-log.md`.
- Both scripts preserve traceability to the `main`-derived staging cutover baseline.

## Operator Requirement

Operators may say that staging reset provenance has been recorded. Operators may not claim that staging has been fully restored from baseline unless a separate stateful restore procedure has been executed and evidence has been attached.

## Future Full Restore Requirements

A full restore contract must add, at minimum:

- database backup artifact identity and checksum
- object/file storage backup identity and checksum
- restore command transcript
- post-restore verification checks
- rollback owner and approval record
