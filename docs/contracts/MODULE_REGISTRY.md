# Module Registry

The module registry validates module metadata and references. It does not execute modules.

Each registry entry includes:

- `moduleId`
- `version`
- `taxonomyPath`
- `lifecycleStage`
- `roles`
- `metadata`
- `problemBriefRef`
- `solutionBriefRef`
- `terminalRefs`
- `dependencyRules`
- `provenance`
- `validationStatus`

Valid fixture:

- `examples/modules/registry.valid.json`

Invalid fixture:

- `examples/modules/registry.invalid.json`

Seed modules:

- `examples/modules/community-meals/`
- `examples/modules/laundry/`
- `examples/modules/utility-demand/`
