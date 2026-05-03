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

No graph compiler or module execution exists in Phase B.
