# Batch 15 Resource Compatibility Audit

## Scope

Batch 15 adds static resource interfaces, compatibility rules, dependency graph contracts, and shared graph link validation. This audit compares the Issue #46, #47, and #48 completion claims against observed repository state and rejects scope drift into graph compilation, module execution, runtime dependency resolution, engine behavior, scenario migration, real-world binding, BOM/export/reporting, UI workflows, or a new Batch 15 CLI graph validation command.

## Issue Rollup

| Issue | Claim | Observed Evidence | Result |
|---|---|---|---|
| #46 | Resource interface contract exists | `ResourceInterfaceSchema` and `ResourceInterfaceRegistrySchema` exist in `packages/shared/src/resourceInterface.ts` and are exported through `packages/shared/src/index.ts` | PASS |
| #46 | Compatibility rule contract exists | `CompatibilityDecisionSchema`, `ResourceCompatibilityRuleSchema`, and `ResourceCompatibilityRuleSetSchema` exist and distinguish `compatible`, `incompatible`, and `requires_adapter` | PASS |
| #46 | Duplicate ids and adapter invariants are enforced | `resourceInterface.test.ts` covers duplicate interface ids, duplicate rule ids, compatible plus adapter flag, and adapter-required without notes | PASS |
| #47 | Module dependency graph contract exists | `DependencyCategorySchema`, `DependencyRequirednessSchema`, `DependencyStateSchema`, node, edge, and graph schemas exist in `packages/shared/src/moduleDependencyGraph.ts` | PASS |
| #47 | Requiredness and state are separate | Nodes use `requiredness: required | optional` and `state: satisfied | unresolved | external` | PASS |
| #47 | Dependency graph validation is static | Tests cover duplicate nodes, duplicate edges, missing node references, unresolved required dependencies, unresolved optional dependencies, and external source refs | PASS |
| #48 | Static graph link validation exists | `validateGraphLinks` and result/issue schemas exist in `packages/shared/src/graphLinkValidation.ts` | PASS |
| #48 | Validator reports compatibility issues | Tests cover success, missing nodes/terminals, invalid direction pairs, resource mismatch, unit mismatch, timing mismatch, adapter warning, missing rules, and duplicate module templates | PASS |
| #49 | Audit and validation evidence exists | Batch 15 artifacts, contract docs, and Docker-inclusive `artifacts/controls/local-validation/latest.json` exist | PASS |

## Required Questions

1. Does the resource interface contract exist? Yes.
2. Does the compatibility rule contract exist? Yes.
3. Do valid resource interface fixtures pass? Yes.
4. Do invalid resource interface fixtures fail? Yes.
5. Do duplicate resource interface ids fail? Yes.
6. Do duplicate compatibility rule ids fail? Yes.
7. Are compatibility rule adapter invariants enforced? Yes.
8. Does the module dependency graph contract exist? Yes.
9. Are dependency requiredness and dependency state separate? Yes.
10. Do dependency graph fixtures pass/fail correctly? Yes.
11. Does unresolved required dependency fail? Yes.
12. Does unresolved optional dependency pass? Yes.
13. Does static graph link validation exist? Yes.
14. Does graph link validation catch missing nodes/terminals? Yes.
15. Does graph link validation catch invalid direction pairs? Yes.
16. Does graph link validation catch resource/unit incompatibility? Yes.
17. Does missing compatibility rule fail closed? Yes.
18. Is adapter-required behavior documented and tested? Yes.
19. Is duplicate template behavior documented and tested? Yes.
20. Did build/test/determinism pass? Yes.
21. Did local validation pass? Yes, including Docker.
22. Did engine behavior remain unchanged? Yes; no `packages/engine` files changed and determinism hash remained `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`.
23. Was forbidden scope avoided? Yes.
24. What remains explicitly not implemented? Batch 15 still does not implement graph compilation, module execution, runtime scheduling, engine refactor, scenario migration, real-world product bindings, BOM/export/reporting pipelines, or UI module workflows.
25. Is the next Phase C issue allowed to start? GO.

## Validation Summary

- `git diff --check` - PASS
- `pnpm --filter @commons-sim/shared build` - PASS
- `pnpm --filter @commons-sim/shared test` - PASS, 65 tests passed
- `pnpm build` - PASS
- `pnpm test` - PASS
- `pnpm determinism:check` - PASS, hash `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`
- `pnpm env:parity:check` - PASS
- `node packages/cli/dist/main.js registry-validate examples/modules/registry.valid.json` - PASS
- `node scripts/controls/run-local-validation.mjs --operator codex-batch-15 --include-docker` - PASS, 11 commands including three Docker builds

Host note: local host Node is `v22.16.0`; repo policy declares Node `20.x`. Docker-inclusive validation passed.

## Forbidden Scope Review

See `artifacts/batches/batch-15/forbidden-scope-review.md`.

Batch 15 did not change `packages/engine`, UI files, CLI command behavior, real-world binding files, BOM/export/reporting files, graph compiler code, module execution code, or runtime scheduler code. The repository contains a later audited Batch 16 CLI graph validation command, but Batch 15 does not claim or modify it.

## Explicit Non-Claims

Batch 15 does not claim graph compilation, module execution, runtime scheduling, runtime dependency resolution, engine refactor, scenario migration to module graphs, real-world product binding, BOM/export generation, reporting, UI module workflows, or a new CLI graph validation command.

## Known Gaps

- Graph compilation remains out of scope.
- Module execution remains out of scope.
- Runtime scheduler remains out of scope.
- Engine refactor remains out of scope.
- Scenario migration to module graphs remains out of scope.
- Real-world product bindings remain out of scope.
- BOM/export/reporting pipelines remain out of scope.
- UI module workflows remain out of scope.
- Batch 15 does not provide a CLI graph validation command; the current repo has later Batch 16 CLI evidence for that separate follow-up.

## GO / NO-GO Decision

GO for the next Phase C issue. The static contracts and validator are implemented, tested, documented, and evidence-backed without Batch 15 forbidden scope drift.
