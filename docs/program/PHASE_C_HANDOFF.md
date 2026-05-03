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

After Batch 13 corrective hardening, the next Phase C issue may begin. Phase C should create the generic module template contract on top of the Phase B contracts.

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

## Validation Gate

Run local validation after Phase C changes:

```powershell
node scripts/controls/run-local-validation.mjs --operator codex-phase-c --include-docker
```
