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

Initial result:

- `develop`: `status: unavailable`; GitHub returned `Branch not protected`.
- `staging`: `status: unavailable`; GitHub returned `Branch not protected`.
- `main`: `status: unavailable`; GitHub returned `Branch not protected`.

Remediation:

- Applied branch protection to `staging` with exact required contexts from `artifacts/controls/required-check-map.json` and `enforce_admins: true`.
- Applied branch protection to `main` with exact required contexts from `artifacts/controls/required-check-map.json` and `enforce_admins: true`.
- Applied branch protection to `develop` with exact required contexts from `artifacts/controls/required-check-map.json` and `enforce_admins: true`.

Current result:

- `staging`: `status: exported`; required checks match the canonical map.
- `main`: `status: exported`; required checks match the canonical map.
- `develop`: `status: exported`; required checks match the canonical map.

## Environment Evidence

Artifacts:

- `artifacts/controls/environments/index.json`
- `artifacts/controls/environments/dev.json`

Initial result:

- Live environment list exported successfully.
- Only `dev` exists in live environment metadata.
- `staging` and `production` are referenced by workflows but were not returned by the live environment list.

Remediation:

- Created `staging` with GitHub environments API.
- Created `production` with GitHub environments API.
- Re-exported environment evidence with `codex-compliance-audit`.

Current result:

- `dev`, `staging`, and `production` all exist in live environment metadata.
- No environment protection reviewers or wait timers are configured yet.

## Drift Ranking

Resolved: live `staging` and `production` environment metadata now exists.

Resolved: live `develop`, `staging`, and `main` branch protection now exists and exports successfully.

The export path is working. Remaining live blocker is the GitHub Actions billing lock that prevents hosted jobs from starting.
