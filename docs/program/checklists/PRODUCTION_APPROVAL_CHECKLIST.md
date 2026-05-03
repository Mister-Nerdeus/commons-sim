# Production Approval Checklist (`staging` -> `main`)

- [ ] PR source is `staging` and target is `main`
- [ ] Release notes completed from template
- [ ] Required checks green using exact contexts from `artifacts/controls/required-check-map.json`: `ci / build_test_smoke`, `dependency-review / dependency-review`, `determinism / determinism`, `release-prod / verify_production_release`
- [ ] Staging validation evidence attached
- [ ] Rollback SHA and rollback operator identified
- [ ] Production approver sign-off recorded
