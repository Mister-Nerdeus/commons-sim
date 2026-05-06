# Next 15 Backlog V4 (`develop` -> `staging` -> `main` Model)

This ordering reflects current repository state after Issues #16-#29.

1. Automate GitHub branch protection/environment settings verification (API-backed audit)
2. Add numeric drift thresholds and failure bands to canonical benchmark matrix
3. Build staging RC evidence bundler (single artifact pack from local validation artifacts)
4. Add web automated tests (wizard flow, manifest load, explainability assertions)
5. Add local screenshot capture command for release evidence bundles
6. Implement schema migration dry-run checker for manifest compatibility
7. Add multi-scenario sensitivity batch mode in CLI
8. Extend canonical library from 3 to 12 scenarios with segment tags
9. Add parity gate for branch/environment evidence drift
10. Add production rollback drill command and quarterly simulation schedule
11. Add environment secret age/rotation compliance check artifact
12. Implement scenario benchmark trend dashboard in web
13. Add contract publication pipeline for manifest and scenario schemas
14. Add signed release notes + changelog generation for `staging` -> `main`
15. Calibrate gas/burnout coefficients with external reference data set

## Ordering Rationale

- Items 1-3 close remaining release-control automation gaps.
- Items 4-8 strengthen validation confidence and testability.
- Items 9-12 harden operational observability and parity assurance.
- Items 13-15 raise contract maturity and model realism for broader adoption.
