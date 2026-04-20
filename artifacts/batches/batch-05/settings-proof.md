# Settings Proof - Batch 05

## Branch Protection Verification

Manual verification required in GitHub repository settings:

- [ ] `main` protected with PR-only merge, approvals, required checks, and no force push/delete.
- [ ] `staging` protected with PR-only merge, approvals, required checks, and no force push/delete.
- [ ] `develop` guarded with PR expectation and CI checks while allowing maintainer flexibility.

Reference policy: `docs/program/BRANCH_PROTECTION_POLICY.md`.

## Environment Verification

Manual verification required in GitHub repository settings:

- [ ] Environment `dev` exists and is branch-restricted to `develop`.
- [ ] Environment `staging` exists and is branch-restricted to `staging`.
- [ ] Environment `production` exists and is branch-restricted to `main`.
- [ ] Environment-specific secrets are configured and separated.

Reference policy: `docs/program/ENVIRONMENT_POLICY.md`.

## Notes

- Repository code and workflows enforce branch-intent naming and mapping.
- GitHub settings/rulesets are external controls and must be captured with screenshots/exports by repository admins.
