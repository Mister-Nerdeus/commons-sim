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
| R-601 Challenge benchmark comparability | High | Active | Maintainer | Split leaderboards by locked benchmark class and reject modified locked fields |
| R-602 Real-world model overclaim | High | Active | Maintainer | Use safety/resilience proxies, require human review, and avoid guaranteed social outcome claims |
| R-603 Competition integrity gap | High | Active | Maintainer | Add server-side re-simulation, signed hashes, persistent submissions, and anti-cheat checks |
