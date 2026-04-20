# Branch Protection Policy

## Policy Intent

This policy enforces the repository authority chain:

- `develop` is an integration playground with safety rails.
- `staging` is protected pre-production for release candidates.
- `main` is locked production authority.

## Required Status Checks (Canonical Names)

The following checks are the baseline required checks for protected branches:

- `ci / build_test_smoke`
- `dependency-review / dependency-review`
- `determinism / determinism`

## Branch Rule Definitions

### `main` (locked production)

- Require pull request before merging: enabled
- Required approvals: 1 minimum
- Require review from Code Owners: enabled
- Require conversation resolution before merge: enabled
- Require status checks to pass: enabled (canonical checks above)
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
- Require status checks to pass: enabled (canonical checks above)
- Require branches up to date before merge: enabled
- Restrict direct pushes: enabled
- Allow force pushes: disabled
- Allow deletions: disabled
- Include administrators: enabled

### `develop` (guardrailed playground)

- Require pull request before merging: enabled
- Required approvals: 1 minimum (may be relaxed temporarily during incidents with documented approval)
- Require status checks to pass: enabled (`ci / build_test_smoke`, `determinism / determinism`)
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
4. Configure required status checks using canonical names above.
5. Verify `CODEOWNERS` review requirement is active on `main` and `staging`.
6. Export screenshots or settings dump to `artifacts/batches/batch-05/`.
