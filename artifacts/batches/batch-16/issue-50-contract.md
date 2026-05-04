# Project Issue #50 - Create CLI Graph Link Validation Entry Point

## Batch

Batch 16 - Phase C Static Graph Validation Entry Points

## Owner

Codex

## Dependencies

- Project Issue #46 resource interface and compatibility rule contracts
- Project Issue #48 static graph link validator
- Batch 15 audit GO decision

## Problem

Batch 15 created `validateGraphLinks` as a shared static utility, but operators still have no CLI entry point for validating graph fixtures against generic templates and resource compatibility rules.

## Scope

Add a CLI command that loads existing graph, template, and compatibility rule contracts, calls the shared static validator, and returns the machine-readable `GraphLinkValidationResult`.

## Invariants

- Static validation only.
- Do not compile graphs.
- Do not execute modules.
- Do not implement runtime dependency resolution.
- Do not refactor `packages/engine`.
- Do not change scenario outputs or determinism goldens.
- Do not add real-world product binding.
- Do not add UI workflows.

## Required Output

- CLI command: `graph-link-validate <graph.json> <compatibility-rules.json> <template.json...>`
- Machine-readable stdout result using `GraphLinkValidationResult`.
- Exit code `0` when no error-level issues are present.
- Exit code `3` when error-level validation issues are present.
- Adapter-required links remain warning-level results.
- Stable input error code: `GRAPH_LINK_VALIDATION_INPUT_ERROR`.

## Acceptance Gates

- `git diff --check`
- `pnpm --filter @commons-sim/cli... build`
- `pnpm --filter @commons-sim/cli test`
- `pnpm build`
- `pnpm test`
- `pnpm determinism:check`
- `node packages/cli/dist/main.js registry-validate examples/modules/registry.valid.json`
- `node packages/cli/dist/main.js graph-link-validate examples/graphs/link-validation.valid.json examples/interfaces/compatibility-rules.valid.json examples/modules/generic/community-meals.template.json examples/modules/generic/laundry.template.json`

## Definition of Done

- CLI command exists.
- Valid graph link fixture exits `0` with `ok: true`.
- Invalid direction fixture exits `3` with `ok: false`.
- Adapter-required fixture exits `0` with warning issue.
- Docs explain the command is static validation, not graph compilation.
