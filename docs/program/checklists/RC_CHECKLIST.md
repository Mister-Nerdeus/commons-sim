# Release Candidate Checklist (`develop` -> `staging`)

- [ ] PR source is `develop` and target is `staging`
- [ ] Changelog summary included
- [ ] Required checks green using exact contexts from `artifacts/controls/required-check-map.json`: `ci / build_test_smoke`, `dependency-review / dependency-review`, `determinism / determinism`, `promote-to-staging / validate_release_candidate`
- [ ] Canonical scenario benchmark deltas attached
- [ ] Residual risk list attached with owners
- [ ] Rollback candidate SHA recorded
