# Batch 11 Live Control Review

## Export Commands

```powershell
node scripts/controls/export-branch-protection.mjs --repo Mister-Nerdeus/commons-sim --branches develop,staging,main --operator codex-batch11
node scripts/controls/export-environments.mjs --repo Mister-Nerdeus/commons-sim --operator codex-batch11
```

## Branch Protection Evidence

Artifacts:

- `artifacts/controls/branch-protection/develop.json`
- `artifacts/controls/branch-protection/staging.json`
- `artifacts/controls/branch-protection/main.json`

Result:

- `develop`: `status: unavailable`; GitHub returned `Branch not protected`.
- `staging`: `status: unavailable`; GitHub returned `Branch not protected`.
- `main`: `status: unavailable`; GitHub returned `Branch not protected`.

## Environment Evidence

Artifacts:

- `artifacts/controls/environments/index.json`
- `artifacts/controls/environments/dev.json`

Result:

- Live environment list exported successfully.
- Only `dev` exists in live environment metadata.
- `staging` and `production` are referenced by workflows but were not returned by the live environment list.

## Drift Ranking

Critical: live branch protection is not currently enforced for `develop`, `staging`, or `main` according to the GitHub API export.

High: live `staging` and `production` environment metadata is absent even though workflows reference those environments.

The export path is working. The live settings must be corrected outside the repo files or by a future explicit settings-automation change.
