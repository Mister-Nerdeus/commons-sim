# Batch 15 Risk Register

| Risk | Level | Status | Mitigation |
|---|---|---|---|
| Static validation drifts into graph compilation | Medium-high | Controlled | `validateGraphLinks` is pure, returns structured issues, and does not mutate inputs or call engine code. |
| Compatibility rules silently coerce resources or units | Medium | Controlled | Rules must explicitly state resource type, unit, unit family, timing, decision, and adapter requirement. |
| Required dependencies are treated as valid when unresolved | Medium | Controlled | `ModuleDependencyGraphSchema` rejects required dependency nodes with unresolved state and required edges targeting unresolved nodes. |
| Adapter-required links are mistaken for implemented adapters | Medium | Controlled | Docs and tests define adapter-required as warning-only static validation. |
| Host runtime differs from repo Node policy | Low | Known | Host is Node `v22.16.0`; Docker-inclusive validation passed. |
