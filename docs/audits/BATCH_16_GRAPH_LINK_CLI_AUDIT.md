# Batch 16 Graph Link CLI Audit

## Scope

Batch 16 adds a CLI entry point for the existing static graph link validator. The audit checks observed repo state against Issue #50 and blocks scope drift into graph compilation, module execution, runtime dependency resolution, engine refactor, scenario migration, real-world product binding, BOM/export/reporting, or UI workflows.

## Issue Rollup

| Issue | Claim | Observed Evidence | Result |
|---|---|---|---|
| #50 | CLI graph link validation command exists | `graph-link-validate` is listed in `packages/cli/src/main.ts` usage and command dispatch | PASS |
| #50 | Command loads graph, compatibility rules, and templates | `packages/cli/src/io.ts` exposes loaders for graph link validation inputs | PASS |
| #50 | Command returns `GraphLinkValidationResult` | `packages/cli/src/main.ts` writes `stableStringify(result)` from `validateGraphLinks` | PASS |
| #50 | Error-level issues exit `3` | `packages/cli/src/main.ts` exits `EXIT_VALIDATION` when `result.ok` is false | PASS |
| #50 | Adapter-required links remain warning-level and exit `0` | `packages/cli/src/graphLinkValidation.test.ts` covers adapter-required zero-exit behavior | PASS |
| #50 | Stable input error code exists | `GRAPH_LINK_VALIDATION_INPUT_ERROR` is emitted by graph, rule, and template load failures | PASS |
| #50 | Docs explain static validation only | `docs/cli/GRAPH_LINK_VALIDATION.md` documents non-compiler/non-runtime behavior | PASS |

## Required Questions

1. Does the CLI command exist? Yes.
2. Does it accept `<graph.json> <compatibility-rules.json> <template.json...>`? Yes.
3. Does it emit machine-readable `GraphLinkValidationResult` JSON? Yes.
4. Does a valid graph link fixture exit `0` with `ok: true`? Yes.
5. Does an invalid direction fixture exit `3` with `ok: false`? Yes.
6. Does an adapter-required fixture exit `0` with a warning? Yes.
7. Does input load failure use `GRAPH_LINK_VALIDATION_INPUT_ERROR`? Yes.
8. Did CLI build/test pass? Yes.
9. Did full build/test/determinism pass? Yes.
10. Did local validation pass? Yes, with Docker enabled.
11. Did engine behavior remain unchanged? Yes; no `packages/engine` files changed and determinism hash stayed `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`.
12. What remains explicitly not implemented? Graph compilation, module execution, runtime dependency resolution, adapter implementation, engine refactor, scenario migration, product binding, BOM/export/reporting, and UI workflows.
13. Is the next Phase C issue allowed to start? GO.

## Validation Summary

- `git diff --check` - PASS
- `pnpm --filter @commons-sim/cli... build` - PASS
- `pnpm --filter @commons-sim/cli test` - PASS, 16 CLI tests passed
- `pnpm build` - PASS
- `pnpm test` - PASS
- `pnpm determinism:check` - PASS, hash `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`
- `pnpm env:parity:check` - PASS
- `node packages/cli/dist/main.js registry-validate examples/modules/registry.valid.json` - PASS
- `node packages/cli/dist/main.js graph-link-validate examples/graphs/link-validation.valid.json examples/interfaces/compatibility-rules.valid.json examples/modules/generic/community-meals.template.json examples/modules/generic/laundry.template.json` - PASS, `ok: true`, `issueCount: 0`
- `node packages/cli/dist/main.js graph-link-validate examples/graphs/link-validation.invalid-direction.json examples/interfaces/compatibility-rules.valid.json examples/modules/generic/community-meals.template.json examples/modules/generic/laundry.template.json` - PASS, exited `3`, `ok: false`
- `node packages/cli/dist/main.js graph-link-validate examples/graphs/link-validation.requires-adapter.json examples/interfaces/compatibility-rules.valid.json examples/modules/generic/community-meals.template.json examples/modules/generic/laundry.template.json` - PASS, exited `0`, emitted `ADAPTER_REQUIRED` warning
- `node scripts/controls/run-local-validation.mjs --operator codex-batch-16 --include-docker` - PASS

## Explicit Non-Claims

Batch 16 does not claim graph compilation, module execution, runtime dependency resolution, adapter implementation, engine refactor, scenario migration to module graphs, real-world product binding, BOM/export generation, reporting, or UI workflows.

## Known Gaps

The CLI requires callers to provide explicit graph, rule, and template file paths. It does not discover templates from a registry, infer adapters, compile graphs, execute modules, or validate a full project manifest graph.

## GO / NO-GO Decision

GO for the next Phase C issue.
