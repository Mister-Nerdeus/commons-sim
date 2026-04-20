# Project Migration Contract

## Purpose

Define explicit migration behavior across promoted releases for saved project manifests.

## Supported Inputs

- v1 manifest (`manifestVersion: 1`) - native format
- legacy v0 manifest (`version: 0`) - auto-migrated to v1

Migration logic: `packages/shared/src/projectMigrations.ts`.

## Compatibility Rules

- Loads must return a validated v1 manifest before simulation.
- Unknown versions are rejected by schema validation.
- Migration metadata must mark legacy upgrades (`metadata.notes`).

## Test Coverage

- `packages/shared/src/projectMigrations.test.ts` validates:
  - v1 pass-through
  - v0 -> v1 upgrade behavior
