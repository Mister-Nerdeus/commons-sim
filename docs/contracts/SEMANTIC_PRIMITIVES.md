# Semantic Primitives

Phase B semantic primitives define reusable schema vocabulary for variables, modules, terminals, graphs, registries, and AI artifact metadata.

Exports:

- `UnitFamilySchema`
- `UnitIdSchema`
- `ProvenanceStateSchema`
- `UncertaintyMetadataSchema`
- `ValidationStatusSchema`
- `ArtifactOriginSchema`
- `ArtifactScopeSchema`
- `ConfidenceSchema`
- `AiArtifactTagSchema`

AI artifact tags include `origin`, `scope`, `confidence`, and `validation_status`. These tags describe provenance and review state only; they do not make generated content authoritative without validation.

Phase B does not change simulation behavior.
