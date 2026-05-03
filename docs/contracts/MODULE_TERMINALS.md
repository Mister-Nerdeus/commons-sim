# Module Terminals

Typed terminals define how future modules may connect. Phase B validates terminal declarations only.

Exports:

- `ModuleTerminalSchema`
- `TerminalDirectionSchema`
- `TerminalAllocationModeSchema`
- `TerminalCriticalitySchema`
- `TerminalFailureSemanticsSchema`

Each terminal includes:

- `id`
- `resourceType`
- `unit`
- `timingModel`
- `nominalCapacity`
- `peakCapacity`
- `qualityAttributes`
- `direction`
- `allocationMode`
- `spatialScope`
- `criticality`
- `failureSemantics`

Terminal ids must be semantic and namespaced:

```text
<domain>.<semantic_name>[_in|_out]
```

Examples:

- `food.ingredients_in`
- `food.meals_out`
- `labor.staff_hours_in`
- `water.potable_in`
- `waste.organic_out`
- `power.electricity_in`

Legacy hyphen-only ids such as `food-input` are rejected.

No graph compiler or module execution exists in Phase B.
