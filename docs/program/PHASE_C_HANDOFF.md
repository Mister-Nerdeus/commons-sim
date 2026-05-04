# Phase C Handoff

## Starting Point

Phase B delivered the semantic foundation:

- semantic primitives
- variable registry
- module taxonomy and lifecycle contracts
- problem and solution brief contracts
- typed terminal contracts
- problem/solution/world graph skeleton contracts
- module registry contract
- registry validation CLI
- seed generic module pack

## Allowed Next Work

After Batch 15 audit, the next Phase C issue may begin. Phase C should consume the static resource compatibility, dependency graph, and graph link validation contracts without claiming graph compilation or module execution.

## Guardrails

Phase C must not claim any of the following until implemented and audited:

- graph compilation
- module execution
- engine refactor
- scenario migration to module graphs
- real-world product binding
- BOM or report export
- UI module catalog/composer

## Required Inputs For Issue #41

- `packages/shared/src/semanticPrimitives.ts`
- `packages/shared/src/moduleTaxonomy.ts`
- `packages/shared/src/moduleBriefs.ts`
- `packages/shared/src/moduleTerminals.ts`
- `packages/shared/src/moduleRegistry.ts`
- `examples/modules/registry.valid.json`

## Batch 13 Corrections Carried Forward

- Codex issues must use the exact issue contract standard in `docs/program/ISSUE_CONTRACT_STANDARD.md`.
- `registry-validate` success and failure outputs use a consistent `ok` envelope.
- Module terminal ids must be semantic and namespaced, for example `food.meals_out`.

## Phase C Progress

- Generic module template contract exists in `packages/shared/src/genericModuleTemplate.ts`.
- Product-agnostic generic template examples exist under `examples/modules/generic/`.
- `docs/contracts/GENERIC_MODULE_TEMPLATE.md` documents the contract and explicit non-claims.
- Resource interface and compatibility rule contracts exist in `packages/shared/src/resourceInterface.ts`.
- Module dependency graph contract exists in `packages/shared/src/moduleDependencyGraph.ts`.
- Static graph link validation exists in `packages/shared/src/graphLinkValidation.ts`.
- Batch 15 audit evidence exists in `docs/audits/BATCH_15_RESOURCE_COMPATIBILITY_AUDIT.md`.

## Batch 15 Corrections Carried Forward

- Compatibility rules distinguish `compatible`, `incompatible`, and `requires_adapter`.
- Adapter-required graph links are warnings, not graph compiler behavior.
- Required dependency edges may not target unresolved dependency nodes.
- Graph link validation remains pure and side-effect-free.

## Validation Gate

Run local validation after Phase C changes:

```powershell
node scripts/controls/run-local-validation.mjs --operator codex-phase-c --include-docker
```
