# Variable Registry

The variable registry defines primitive variables independently of scenario execution.

Exports:

- `VariableDefinitionSchema`
- `VariableRegistrySchema`
- `VariableValueTypeSchema`
- `VariableEditabilitySchema`

Each variable definition includes:

- `id`
- `name`
- `domain`
- `type`
- `unit`
- `validRange`
- `defaultValue`
- `provenance`
- `uncertainty`
- `editability`
- `dependencyNotes`

Rules enforced by schema/tests:

- units are explicit
- duplicate ids fail
- default values must match type
- default values must be inside valid ranges
- missing required metadata fails

Fixture paths:

- valid: `examples/variables/core-human-settlement.variables.json`
- invalid: `examples/variables/invalid-variable.examples.json`
