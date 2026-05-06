# Branch Governance

## Required Local Validation
GitHub Actions is disabled and is not a merge gate. The following local validation evidence must exist before merge to protected branches:

- `artifacts/controls/local-validation/latest.json`
- Release-grade Docker validation from `Dockerfile.local-validation`

## Deployment Gating
- Deployments must reference the reviewed commit SHA and the matching local validation evidence.
- No deployment should bypass the local validation artifact gate.

## Ownership Rules
- `CODEOWNERS` is mandatory and must include at least one maintainer for:
  - `/packages/engine/`
  - `/packages/shared/`
  - `/.github/`
  - `/docs/program/`
- PR review from a code owner is required for protected branches.

## Dependency Policy
- Dependency changes must be reviewed locally by inspecting `pnpm-lock.yaml`, package manifests, and dependency risk notes.
- Dependabot updates are enabled for npm dependencies only.
- High-risk dependency changes require explicit mention in PR risk section.

## Branch Protection Rules (Manual GitHub Settings Checklist)
These cannot be fully represented in repository files and must be configured in GitHub repo settings:
1. Protect `main` branch.
2. Require a pull request before merging.
3. Require at least 1 approving review.
4. Require review from Code Owners.
5. Disable required GitHub status checks; require local validation evidence in the PR/release record.
6. Disable GitHub Actions for the repository.
7. Require branches to be up to date before merging where practical for release branches.
8. Restrict who can push directly to `main` (no direct pushes).
9. Include administrators in branch protection.
10. Disable force pushes and branch deletion on `main`.

## Merge Policy
- Squash or merge commits are allowed as configured in repo settings.
- Auto-merge is disabled unless local validation evidence and review requirements are satisfied.

## Operator Procedure
- Before merge: verify local validation evidence, review status, and evidence links in PR template.
- After merge: verify deployment references the reviewed commit and local validation artifact.
