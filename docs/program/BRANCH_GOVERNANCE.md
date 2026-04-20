# Branch Governance

## Required Checks
The following checks must pass before merge to `main`:
- `ci / build_test_smoke`
- `dependency-review / dependency-review`

## Deployment Gating
- `pages` deploy only runs after `ci` completes successfully on `main`.
- Deploy job checks out the exact successful CI commit SHA.
- No direct deploy workflow should bypass the CI result gate.

## Ownership Rules
- `CODEOWNERS` is mandatory and must include at least one maintainer for:
  - `/packages/engine/`
  - `/packages/shared/`
  - `/.github/`
  - `/docs/program/`
- PR review from a code owner is required for protected branches.

## Dependency Policy
- Pull requests must run `dependency-review`.
- Dependabot updates are enabled for npm dependencies and GitHub Actions.
- High-risk dependency changes require explicit mention in PR risk section.

## Branch Protection Rules (Manual GitHub Settings Checklist)
These cannot be fully represented in repository files and must be configured in GitHub repo settings:
1. Protect `main` branch.
2. Require a pull request before merging.
3. Require at least 1 approving review.
4. Require review from Code Owners.
5. Require status checks to pass before merging:
   - `ci / build_test_smoke`
   - `dependency-review / dependency-review`
6. Require branches to be up to date before merging.
7. Restrict who can push directly to `main` (no direct pushes).
8. Include administrators in branch protection.
9. Disable force pushes and branch deletion on `main`.

## Merge Policy
- Squash or merge commits are allowed as configured in repo settings.
- Auto-merge is allowed only when required checks are green and review requirements are satisfied.

## Operator Procedure
- Before merge: verify checks, review status, and evidence links in PR template.
- After merge: verify `pages` workflow executed from CI-gated commit when applicable.
