# Live Control Evidence

## Purpose

Policy files describe intended controls. Live control evidence records what GitHub is enforcing at export time. Audit reviews must distinguish those two sources.

## Export Commands

Apply branch protection from the canonical required-check map:

```powershell
node scripts/controls/apply-branch-protection.mjs --repo Mister-Nerdeus/commons-sim --dry-run
node scripts/controls/apply-branch-protection.mjs --repo Mister-Nerdeus/commons-sim --enforce-admins
node scripts/controls/apply-branch-protection.mjs --repo Mister-Nerdeus/commons-sim --branches staging,main --enforce-admins
```

Run the dry run first and compare the emitted contexts to `artifacts/controls/required-check-map.json`. Use `--enforce-admins` for the policy-compliant live setting; applying that option to `develop` blocks direct admin pushes and should be done after evidence updates are committed.

Branch protection:

```powershell
node scripts/controls/export-branch-protection.mjs --repo Mister-Nerdeus/commons-sim --branches develop,staging,main --operator <name>
```

Environments:

```powershell
node scripts/controls/export-environments.mjs --repo Mister-Nerdeus/commons-sim --operator <name>
```

## Artifact Locations

- Branch protection evidence: `artifacts/controls/branch-protection/*.json`
- Environment evidence: `artifacts/controls/environments/*.json`
- Required-check policy map: `artifacts/controls/required-check-map.json`

## Refresh Cadence

Refresh live evidence:

- before each release-candidate promotion
- before each production promotion
- after changing repository rulesets, branch protection, required checks, or environments
- during control-plane audits

The release operator owns refresh execution. The approver owns reviewing diffs between policy and live artifacts.

## Review Rules

- A policy file alone is not proof of live enforcement.
- Screenshots may supplement evidence but are not a substitute for exported JSON artifacts.
- If an export returns `status: unavailable`, the audit must record whether the branch or environment is intentionally absent, missing, or inaccessible with the current token.
