# Batch 11 Risk Register

| Rank | Risk | Evidence | Owner | Required Action |
| --- | --- | --- | --- | --- |
| Accepted | GitHub-hosted Actions jobs cannot start because the account is locked due to a billing issue. | User direction: no GitHub Actions; perform validation locally. | Repository/account administrator | Do not use hosted Actions as an acceptance gate. |
| Resolved | Live branch protection was absent for `develop`. | `artifacts/controls/branch-protection/develop.json` now exports PR/review/conversation/admin protection with no required status checks. | Repository administrator | Require local validation evidence before approval. |
| Resolved | Live branch protection was absent for `staging` and `main`. | `artifacts/controls/branch-protection/staging.json` and `artifacts/controls/branch-protection/main.json` now export PR/review/conversation/admin protection with no required status checks. | Repository administrator | Require local validation evidence before approval. |
| Resolved | Live `staging` and `production` environments were absent from the GitHub environment export. | `artifacts/controls/environments/index.json` now lists `dev`, `production`, and `staging`. | Repository administrator | Add reviewer/wait-time protections later if required by release policy. |
| Accepted | Host local validation ran under Node `v22.16.0`, not Node `20.19.0`. | `artifacts/controls/local-validation/latest.json` | Operator | Use `Dockerfile.local-validation` as release-grade validation because it runs Node `20.19.0`. |
| Low | Staging reset remains metadata-only. | `docs/data/STAGING_RESET_CONTRACT.md` | Data/operator owner | Implement a future full state restore contract before making stronger staging reset claims. |
