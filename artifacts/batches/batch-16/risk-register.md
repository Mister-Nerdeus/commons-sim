# Batch 16 Risk Register

| Risk | Level | Status | Mitigation |
|---|---|---|---|
| CLI graph validation is mistaken for graph compilation | Medium-high | Controlled | Audit, CLI docs, and command behavior state static validation only. |
| Adapter-required warning is mistaken for implemented adapter behavior | Medium | Controlled | Tests verify warning-level output only; known gaps list adapter implementation as absent. |
| Input load failures become unstable for automation | Medium | Controlled | CLI emits stable `GRAPH_LINK_VALIDATION_INPUT_ERROR` for graph, rule, and template load failures. |
| Host runtime differs from repo Node policy | Low | Known | Host is Node `v22.16.0`; Docker-inclusive validation passed. |
