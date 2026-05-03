# Branch Protection Policy

## Policy Intent

This policy enforces the repository authority chain:

- `develop` is an integration playground with safety rails.
- `staging` is protected pre-production for release candidates.
- `main` is locked production authority.

## Required Status Checks (Canonical Names)

The canonical required-check map is versioned at `artifacts/controls/required-check-map.json`. Required status checks must be copied from that artifact exactly; do not abbreviate workflow names or job names in repository rulesets.

### `develop`

- `ci / build_test_smoke`
- `determinism / determinism`

### `staging`

- `ci / build_test_smoke`
- `dependency-review / dependency-review`
- `determinism / determinism`
- `promote-to-staging / validate_release_candidate`

### `main`

- `ci / build_test_smoke`
- `dependency-review / dependency-review`
- `determinism / determinism`
- `release-prod / verify_production_release`

Determinism is represented by a real standalone workflow context, `determinism / determinism`. The `ci / build_test_smoke` job also runs `pnpm determinism:check`, but protected-branch settings must use the standalone determinism context listed above.

## Branch Rule Definitions

### `main` (locked production)

- Require pull request before merging: enabled
- Required approvals: 1 minimum
- Require review from Code Owners: enabled
- Require conversation resolution before merge: enabled
- Require status checks to pass: enabled (`main` canonical checks above)
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
- Require status checks to pass: enabled (`staging` canonical checks above)
- Require branches up to date before merge: enabled
- Restrict direct pushes: enabled
- Allow force pushes: disabled
- Allow deletions: disabled
- Include administrators: enabled

### `develop` (guardrailed playground)

- Require pull request before merging: enabled
- Required approvals: 1 minimum (may be relaxed temporarily during incidents with documented approval)
- Require status checks to pass: enabled (`develop` canonical checks above)
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
4. Configure required status checks using the exact branch-specific contexts in `artifacts/controls/required-check-map.json`.
5. Verify `CODEOWNERS` review requirement is active on `main` and `staging`.
6. Export live branch-protection evidence to `artifacts/controls/branch-protection/`.
