# Batch 14 Contract Index

## Generic Module Template

- Schema: `packages/shared/src/genericModuleTemplate.ts`
- Exports:
  - `GenericModuleTemplateSchema`
  - `ModuleFootprintSchema`
  - `ModuleCapacitySchema`
  - `ModuleDependencyRuleSchema`
  - `ModuleBaselineCostSchema`
  - `ModuleFairnessProfileSchema`
- Documentation: `docs/contracts/GENERIC_MODULE_TEMPLATE.md`
- Valid fixtures:
  - `examples/modules/generic/community-meals.template.json`
  - `examples/modules/generic/laundry.template.json`
- Invalid fixture:
  - `examples/modules/generic/invalid-product-specific.template.json`

## Reused Phase B Contracts

- `ModuleTerminalSchema`
- `ModuleTaxonomyPathSchema`
- `ModuleLifecycleStageSchema`
- `ModuleRoleSchema`
- `ProvenanceStateSchema`
- `ValidationStatusSchema`
- `UnitIdSchema`
