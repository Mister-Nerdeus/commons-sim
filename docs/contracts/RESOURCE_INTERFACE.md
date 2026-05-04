# Resource Interface Contract

Batch 15 defines resource interfaces and compatibility rules as a static contract layer. These schemas describe which resources and terminals can be considered for a graph link, but they do not compile graphs, execute modules, schedule flows, convert units, or infer missing adapters.

## Resource Interfaces

`ResourceInterfaceSchema` lives in `packages/shared/src/resourceInterface.ts`.

A resource interface declares:

- `id`
- `resourceType`
- `unit`
- `unitFamily`
- `timingModels`
- `qualityAttributes`
- `allowedDirections`
- `notes`
- `provenance`
- `validationStatus`

`ResourceInterfaceRegistrySchema` groups interfaces under `registryId`, `version`, `interfaces`, and `validationStatus`. Duplicate interface ids are rejected.

## Compatibility Rules

`ResourceCompatibilityRuleSchema` is the machine-testable contract for static terminal compatibility.

A rule declares:

- `id`
- `fromResourceType`
- `toResourceType`
- `fromUnit`
- `toUnit`
- `fromUnitFamily`
- `toUnitFamily`
- `fromDirection`
- `toDirection`
- `fromTimingModel`
- `toTimingModel`
- `capacityRelation`
- `allocationModeCompatibility`
- `criticalityRelation`
- `decision`
- `rationale`
- `requiresAdapter`
- `adapterNotes`
- `qualityRequirements`

Valid `decision` values are `compatible`, `incompatible`, and `requires_adapter`.

Rules never silently coerce resources or units. If a resource, unit, or timing model changes across a link, that change must be explicit in a rule. Adapter-required decisions are explicit and testable; they are not graph compilation.

## Fixtures

- `examples/interfaces/resource-interfaces.valid.json`
- `examples/interfaces/resource-interfaces.invalid.json`
- `examples/interfaces/compatibility-rules.valid.json`
- `examples/interfaces/compatibility-rules.invalid.json`

## Non-Claims

This contract does not implement module execution, graph compilation, runtime dependency resolution, real-world product binding, BOM/export behavior, reporting, or UI workflows.
