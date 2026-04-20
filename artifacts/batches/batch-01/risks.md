# batch-01 risk delta

| Risk | Before | After | Residual |
|---|---|---|---|
| Governance drift | High | Low | Maintain audit discipline each batch |
| Runtime mismatch local vs CI | High | Medium | Enforce Node 20.x usage in developer environments |
| Deploy bypass | Medium | Low | `pages` now requires successful `ci` workflow_run on `main` |
| Branch protection misconfiguration | Medium | Medium | Manual GitHub settings checklist must be applied and verified |
