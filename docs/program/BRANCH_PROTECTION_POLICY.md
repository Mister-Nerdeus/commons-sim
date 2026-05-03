# Branch Protection Policy

## Policy Intent

This policy enforces the repository authority chain:

- `develop` is an integration playground with safety rails.
- `staging` is protected pre-production for release candidates.
- `main` is locked production authority.

## Required Validation

GitHub Actions is not a governance gate for this repository. The canonical required-check map is versioned at `artifacts/controls/required-check-map.json` and explicitly sets `githubStatusChecksRequired: false`.

Local validation is the required gate:

- Required local validation map: `artifacts/controls/local-required-check-map.json`
- Required local evidence: `artifacts/controls/local-validation/latest.json`
- Release-grade local validation command: `docker build -f Dockerfile.local-validation -t commons-sim:local-validation .`
- Transcript-producing command: `node scripts/controls/run-local-validation.mjs --operator <name> --include-docker`

Determinism is represented by the required local command `pnpm determinism:check`, and by `Dockerfile.local-validation`, which runs the same determinism check under Node `20.19.0`.

## Branch Rule Definitions

### `main` (locked production)

- Require pull request before merging: enabled
- Required approvals: 1 minimum
- Require review from Code Owners: enabled
- Require conversation resolution before merge: enabled
- Require status checks to pass: disabled; local validation artifact required before approval
- Require branches up to date before merge: enabled
- Restrict direct pushes: enabled
- Allow force pushes: disabled
- Allow deletions: disabled
- Include administrators: enabled

### `staging` (protected pre-production)

- Require pull request before merging: enabled
- Required approvals: 1 minimum
- Require review from Code Owners: enabled
- Require conversation resolution before merge: enabled
- Require status checks to pass: disabled; local validation artifact required before approval
- Require branches up to date before merge: enabled
- Restrict direct pushes: enabled
- Allow force pushes: disabled
- Allow deletions: disabled
- Include administrators: enabled

### `develop` (guardrailed playground)

- Require pull request before merging: enabled
- Required approvals: 1 minimum (may be relaxed temporarily during incidents with documented approval)
- Require status checks to pass: disabled; local validation artifact required before approval
- Require branches up to date before merge: disabled
- Restrict direct pushes: disabled for maintainers
- Allow force pushes: disabled
- Allow deletions: disabled
- Include administrators: enabled

## Promotion Constraints

- `main` accepts changes only from `staging` promotion PRs.
- `staging` accepts changes only from release-candidate promotion PRs from `develop`.
- Direct `develop` to `main` merges are prohibited.

## Manual Settings Checklist

These controls must be configured in GitHub repository settings/rulesets:

1. Create or update branch protection/ruleset for `main` with locked production controls.
2. Create or update branch protection/ruleset for `staging` with protected pre-production controls.
3. Create or update branch protection/ruleset for `develop` with lighter controls.
4. Disable GitHub required status checks and require local validation evidence in the PR/release record.
5. Verify `CODEOWNERS` review requirement is active on `main` and `staging`.
6. Export live branch-protection evidence to `artifacts/controls/branch-protection/`.
