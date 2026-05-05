# Batch 15 Contract Index

## Resource Interfaces

- Schema: `packages/shared/src/resourceInterface.ts`
- Tests: `packages/shared/src/resourceInterface.test.ts`
- Docs: `docs/contracts/RESOURCE_INTERFACE.md`
- Fixtures: `examples/interfaces/resource-interfaces.valid.json`, `examples/interfaces/resource-interfaces.invalid.json`, `examples/interfaces/duplicate-resource-interface-id.invalid.json`, `examples/interfaces/compatibility-rules.valid.json`, `examples/interfaces/compatibility-rules.invalid.json`, `examples/interfaces/duplicate-compatibility-rule-id.invalid.json`, `examples/interfaces/bad-compatible-requires-adapter.invalid.json`, `examples/interfaces/bad-requires-adapter-no-notes.invalid.json`

## Module Dependency Graph

- Schema: `packages/shared/src/moduleDependencyGraph.ts`
- Tests: `packages/shared/src/moduleDependencyGraph.test.ts`
- Docs: `docs/contracts/MODULE_DEPENDENCY_GRAPH.md`
- Fixtures: `examples/dependencies/module-dependency-graph.valid.json`, `examples/dependencies/module-dependency-graph.invalid.json`, `examples/dependencies/duplicate-dependency-node-id.invalid.json`, `examples/dependencies/duplicate-dependency-edge-id.invalid.json`, `examples/dependencies/missing-node-reference.invalid.json`, `examples/dependencies/unresolved-required-dependency.invalid.json`, `examples/dependencies/unresolved-optional-dependency.valid.json`, `examples/dependencies/external-missing-source-ref.invalid.json`

## Static Graph Link Validation

- Utility and result schemas: `packages/shared/src/graphLinkValidation.ts`
- Tests: `packages/shared/src/graphLinkValidation.test.ts`
- Docs: `docs/contracts/GRAPH_LINK_VALIDATION.md`
- Fixtures: `examples/graphs/link-validation.valid.json`, `examples/graphs/link-validation.invalid-direction-input-input.json`, `examples/graphs/link-validation.invalid-direction-output-output.json`, `examples/graphs/link-validation.invalid-direction-input-output.json`, `examples/graphs/link-validation.invalid-resource.json`, `examples/graphs/link-validation.incompatible-unit.json`, `examples/graphs/link-validation.requires-adapter.json`, `examples/graphs/link-validation.missing-rule.json`, `examples/graphs/link-validation.missing-terminal.json`, `examples/graphs/link-validation.duplicate-template.json`
