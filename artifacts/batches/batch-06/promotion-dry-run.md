# Promotion Dry Run Evidence

## Develop -> Staging (RC)

- Contract doc: `docs/program/DEVELOP_TO_STAGING_PROMOTION.md`
- Checklist: `docs/program/checklists/RC_CHECKLIST.md`
- Workflow: `.github/workflows/promote-to-staging.yml`

Example evidence set for RC PR:

- Changelog summary present
- Determinism check green
- Canonical scenario benchmark links present
- Residual risk owners recorded

## Staging -> Main (Production)

- Contract doc: `docs/program/STAGING_TO_MAIN_RELEASE.md`
- Checklist: `docs/program/checklists/PRODUCTION_APPROVAL_CHECKLIST.md`
- Workflow: `.github/workflows/release-prod.yml`
- Release notes template: `docs/program/templates/RELEASE_NOTES_TEMPLATE.md`
- Rollback template: `docs/program/templates/ROLLBACK_RECORD_TEMPLATE.md`
