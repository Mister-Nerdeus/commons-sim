# Risk Register

| Risk ID | Severity | Status | Owner | Mitigation |
|---|---|---|---|---|
| R-001 Runtime drift | Medium | Active | Maintainer | Enforce Node 20.x locally and in CI |
| R-101 Semantic coefficient calibration (gas/burnout) | Medium | Active | Maintainer | Calibrate against reference data in next cycle |
| R-201 Web testing gap | High | Active | Maintainer | Add web test/coverage gates as next backlog #1 |
| R-301 Screenshot evidence automation gap | Medium | Active | Maintainer | Add automated screenshot capture pipeline |
| R-401 Contract consumer migration risk | Low | Active | Maintainer | Publish migration notes and keep backward metadata |
| R-501 GitHub settings drift from documented policy | High | Active | Maintainer | Add API-backed settings audit and block releases on mismatch |
| R-502 Runtime engine mismatch (Node 22 vs Node 20 target) | Medium | Active | Maintainer | Enforce Node 20 in local/CI with version check gate |
| R-503 Web workflow testing gap for wizard/persistence | High | Active | Maintainer | Add automated web tests and release evidence snapshots |
