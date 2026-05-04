# Module Dependency Graph Contract

Batch 15 defines a static dependency graph contract for module dependency declarations. It records dependency nodes and edges so future validators can detect unresolved resources, services, controls, labor, information, and spatial context.

This is contract-only. It does not resolve dependencies, execute modules, compile graphs, schedule work, or alter engine behavior.

## Categories and States

`DependencyCategorySchema` supports:

- `resource`
- `service`
- `control`
- `spatial`
- `labor`
- `information`

`DependencyStateSchema` supports:

- `required`
- `optional`
- `satisfied`
- `unresolved`
- `external`

## Nodes

`ModuleDependencyNodeSchema` requires:

- `id`
- `moduleId`
- `templateId`
- `dependencyType`
- `state`
- `description`
- `sourceRef`

## Edges

`ModuleDependencyEdgeSchema` requires:

- `id`
- `fromNodeId`
- `toNodeId`
- `dependencyType`
- `required`
- `rationale`

## Graph

`ModuleDependencyGraphSchema` requires:

- `graphId`
- `version`
- `nodes`
- `edges`
- `validationStatus`

The graph schema rejects duplicate dependency node ids, duplicate edge ids, edges that reference missing nodes, and required edges that point at unresolved dependency nodes.

## Fixtures

- `examples/dependencies/module-dependency-graph.valid.json`
- `examples/dependencies/module-dependency-graph.invalid.json`
- `examples/dependencies/unresolved-dependencies.invalid.json`

## Non-Claims

This contract does not implement runtime dependency resolution, graph compilation, module execution, real-world product binding, reporting, BOM/export behavior, or UI workflows.
