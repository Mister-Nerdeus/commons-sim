# Generic Module Template

Generic module templates are product-agnostic module contracts for Phase C. They define playable/design-facing module structure without executing modules, compiling graphs, binding products, or changing engine behavior.

Exports:

- `GenericModuleTemplateSchema`
- `ModuleFootprintSchema`
- `ModuleCapacitySchema`
- `ModuleDependencyRuleSchema`
- `ModuleBaselineCostSchema`
- `ModuleFairnessProfileSchema`

Each generic template includes:

- `templateId`
- `moduleId`
- `version`
- `lifecycleStage`
- `taxonomyPath`
- `roles`
- `name`
- `summary`
- `problemBriefRef`
- `solutionBriefRef`
- `footprint`
- `capacity`
- `requiredInputs`
- `outputs`
- `dependencies`
- `baselineCosts`
- `fairness`
- `provenance`
- `validationStatus`

`lifecycleStage` must be `Generic Template`. Required inputs and outputs reuse `ModuleTerminalSchema`, so terminal ids must be semantic and namespaced.

Generic templates must remain product-agnostic. Manufacturer, model number, vendor SKU, real product binding, and source-backed product performance fields belong to later binding contracts, not this template layer.

This contract does not implement module execution, graph compilation, engine refactor, scenario migration, real-world binding, BOM generation, reporting, or UI workflows.
