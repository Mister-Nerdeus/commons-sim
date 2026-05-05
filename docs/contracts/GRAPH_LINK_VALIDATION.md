# Graph Link Validation Contract

Batch 15 adds a pure static validator for graph links. `validateGraphLinks` lives in `packages/shared/src/graphLinkValidation.ts` and inspects only supplied graph nodes, graph edges, generic module templates, and resource compatibility rules.

The validator does not compile graphs, execute modules, schedule flows, mutate input data, infer adapters, convert units, or call the engine.

## Inputs

`validateGraphLinks(graph, templates, compatibilityRules)` expects:

- a graph-like object with `nodes` and `edges`
- generic module templates containing terminal declarations
- either a `ResourceCompatibilityRuleSet` or an array of `ResourceCompatibilityRule` objects

## Result

`GraphLinkValidationResultSchema` returns:

- `ok`
- `issueCount`
- `issues`

`ok` is true when no `error` severity issues are present. Warnings still count in `issueCount`.

## Issues

`GraphLinkValidationIssueSchema` returns:

- `code`
- `severity`
- `edgeId`
- `message`
- `details`

Allowed severities are `error`, `warning`, and `info`.

Expected issue codes include:

- `MISSING_FROM_NODE`
- `MISSING_TO_NODE`
- `MISSING_FROM_TERMINAL`
- `MISSING_TO_TERMINAL`
- `INVALID_DIRECTION_PAIR`
- `INCOMPATIBLE_RESOURCE_TYPE`
- `INCOMPATIBLE_UNIT`
- `INCOMPATIBLE_TIMING`
- `ADAPTER_REQUIRED`
- `MISSING_COMPATIBILITY_RULE`

## Adapter-Required Behavior

Rules with `decision: "requires_adapter"` produce an `ADAPTER_REQUIRED` warning. The validator returns `ok: true` for adapter-required links when no errors are present. This is a static warning path only; it does not create or execute an adapter.

## Compatibility Rules

If no explicit compatibility rule matches a link, the validator fails closed with `MISSING_COMPATIBILITY_RULE`. Resource changes, unit changes, and timing changes are also reported as diagnostic errors unless an explicit rule accounts for them.

## Fixtures

- `examples/graphs/link-validation.valid.json`
- `examples/graphs/link-validation.invalid-direction.json`
- `examples/graphs/link-validation.invalid-resource.json`
- `examples/graphs/link-validation.requires-adapter.json`

## Non-Claims

This utility is not a graph compiler, runtime resolver, module executor, scenario migration tool, product binding layer, reporting tool, export tool, or UI workflow.
