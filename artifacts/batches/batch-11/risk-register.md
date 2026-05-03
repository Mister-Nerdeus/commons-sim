# Batch 11 Risk Register

| Rank | Risk | Evidence | Owner | Required Action |
| --- | --- | --- | --- | --- |
| Critical | Live branch protection is absent for `develop`, `staging`, and `main`. | `artifacts/controls/branch-protection/*.json` all report `Branch not protected`. | Repository administrator | Configure branch protection/rulesets using `artifacts/controls/required-check-map.json`, then re-export evidence. |
| High | Live `staging` and `production` environments are absent from the GitHub environment export. | `artifacts/controls/environments/index.json` lists only `dev`. | Repository administrator | Create/configure staging and production environments, then re-export evidence. |
| Medium | Local non-Docker validation ran under Node `v22.16.0`, not Node `20.19.0`. | `artifacts/batches/batch-11/validation-log.md` | Operator | Use Node `20.19.0` locally for release validation; Docker builds already validated the pinned runtime. |
| Low | Staging reset remains metadata-only. | `docs/data/STAGING_RESET_CONTRACT.md` | Data/operator owner | Implement a future full state restore contract before making stronger staging reset claims. |
