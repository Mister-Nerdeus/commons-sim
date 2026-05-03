# Batch 12 Risk Register

| Rank | Risk | Status | Mitigation |
| --- | --- | --- | --- |
| Medium | Contracts are broad and may need tightening once real module execution exists. | Accepted | Phase C must add stricter template semantics before execution. |
| Medium | Registry references are path strings, not referentially loaded by the shared schema. | Accepted | CLI validates registry shape only in Phase B; reference-resolution validation belongs to later tooling. |
| Low | Host validation runs under Node `v22.16.0`. | Accepted | Docker local validation runs Node `20.19.0` and is the release-grade gate. |
| Low | No engine behavior consumes these contracts yet. | Intentional | Phase B is schema-only by invariant. |
