# Batch 11 Risk Register

| Rank | Risk | Evidence | Owner | Required Action |
| --- | --- | --- | --- | --- |
| Critical | GitHub-hosted Actions jobs cannot start because the account is locked due to a billing issue. | Batch 11 pushed commit `ec7e873142d4ac4c95d78ee6bc3e7b3b48120b9a`; check annotation on `ci / build_test_smoke` says the job was not started because of billing lock. | Repository/account administrator | Resolve GitHub billing lock, then re-run failed workflow runs. |
| Resolved | Live branch protection was absent for `develop`. | `artifacts/controls/branch-protection/develop.json` now exports required checks from the canonical map with admin enforcement enabled. | Repository administrator | Monitor hosted checks after billing lock is resolved. |
| Resolved | Live branch protection was absent for `staging` and `main`. | `artifacts/controls/branch-protection/staging.json` and `artifacts/controls/branch-protection/main.json` now export required checks from the canonical map with admin enforcement enabled. | Repository administrator | Monitor hosted checks after billing lock is resolved. |
| Resolved | Live `staging` and `production` environments were absent from the GitHub environment export. | `artifacts/controls/environments/index.json` now lists `dev`, `production`, and `staging`. | Repository administrator | Add reviewer/wait-time protections later if required by release policy. |
| Medium | Local non-Docker validation ran under Node `v22.16.0`, not Node `20.19.0`. | `artifacts/batches/batch-11/validation-log.md` | Operator | Use Node `20.19.0` locally for release validation; Docker builds already validated the pinned runtime. |
| Low | Staging reset remains metadata-only. | `docs/data/STAGING_RESET_CONTRACT.md` | Data/operator owner | Implement a future full state restore contract before making stronger staging reset claims. |
