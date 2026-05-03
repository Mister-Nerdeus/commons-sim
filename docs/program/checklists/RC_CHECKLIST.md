# Release Candidate Checklist (`develop` -> `staging`)

- [ ] PR source is `develop` and target is `staging`
- [ ] Changelog summary included
- [ ] Local validation evidence attached from `artifacts/controls/local-validation/latest.json`
- [ ] Release-grade Docker validation passed: `docker build -f Dockerfile.local-validation -t commons-sim:local-validation .`
- [ ] Canonical scenario benchmark deltas attached
- [ ] Residual risk list attached with owners
- [ ] Rollback candidate SHA recorded
