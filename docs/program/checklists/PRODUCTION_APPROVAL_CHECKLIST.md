# Production Approval Checklist (`staging` -> `main`)

- [ ] PR source is `staging` and target is `main`
- [ ] Release notes completed from template
- [ ] Local validation evidence attached from `artifacts/controls/local-validation/latest.json`
- [ ] Release-grade Docker validation passed: `docker build -f Dockerfile.local-validation -t commons-sim:local-validation .`
- [ ] Staging validation evidence attached
- [ ] Rollback SHA and rollback operator identified
- [ ] Production approver sign-off recorded
