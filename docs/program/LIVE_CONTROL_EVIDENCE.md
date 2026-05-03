# Live Control Evidence

## Purpose

Policy files describe intended controls. Live control evidence records what GitHub is enforcing at export time. Audit reviews must distinguish those two sources.

## Export Commands

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
