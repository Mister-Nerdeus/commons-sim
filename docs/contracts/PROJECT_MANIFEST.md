# Project Manifest Contract

## Version

- Current manifest version: `1`

## Schema

Manifest schema is defined in `packages/shared/src/projectManifest.ts`.

Required fields:

- `manifestVersion` (literal `1`)
- `projectId`
- `projectTitle`
- `createdAtUtc`
- `updatedAtUtc`
- `sourceBranch` (`develop` | `staging` | `main`)
- `scenario` (must validate with `ScenarioSchema`)
- `metadata` (`notes`, `engineVersion`)

## CLI Persistence Flows

- Save: `node packages/cli/dist/main.js project-save <scenario.json> <manifest.json>`
- Load: `node packages/cli/dist/main.js project-load <manifest.json>`

## Failure Behavior

- Invalid manifest shape must fail loudly via schema validation.
- Invalid scenario payload in manifest must fail loudly during load.
