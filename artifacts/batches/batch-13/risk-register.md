# Batch 13 Risk Register

| Risk | Level | Status | Mitigation |
|---|---|---|---|
| Evidence discipline weakened while editing issue template | Low | Closed | Template keeps mandatory Definition of Done, Acceptance Gates, Closeout Evidence, and Risks sections |
| CLI error envelope change affects existing commands | Low | Closed | Existing CLI tests pass; error payload adds `ok: false` without removing `error.code` or `error.message` |
| Terminal fixture and graph fixture ids drift | Medium | Closed for Batch 13 | Terminal and graph schemas share the semantic id pattern; fixtures and tests were updated |
| Phase C approved too early | Medium | Closed | Audit lists explicit non-claims and known gaps; GO applies only to the next contract-layer issue |
