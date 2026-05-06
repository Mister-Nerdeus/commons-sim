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
# V1 and V2 Boundary

ProjectManifest V1 remains supported and validates existing Scenario V1 projects. ProjectManifestV2 is the editable freeform design container. V1 can migrate to V2 while preserving the original Scenario V1 as `compiledScenario`.

Scenario V1 is simulation input; ProjectManifestV2 is project/design storage.
