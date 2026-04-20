# Next 15 Backlog (Reordered)

This backlog is dependency-ranked based on audits of Issues #1-#15.

1. Web test harness and coverage gates (critical reliability gap on `apps/web`)
2. Visual regression snapshots for comparison workspace
3. Scenario library expansion (at least 12 canonical scenarios)
4. Scenario editor UI with inline schema validation
5. Explainability panel linking deltas to formula contributors
6. Export formats: JSON + CSV parity with markdown report
7. Batch compare mode (one baseline vs N candidates)
8. Assumption sensitivity sweep tooling
9. Performance profiling for large scenario horizons
10. Accessibility hardening (keyboard + contrast + landmarks)
11. Internationalization-ready units/currency formatting
12. Contract publication automation (JSON Schema artifacts)
13. CLI batch mode for multi-scenario pipelines
14. Release pipeline with versioned changelog and tags
15. External calibration pass for gas/burnout coefficients

## Dependency Notes
- Items 1-2 precede feature expansion to avoid UI regressions.
- Items 3-8 depend on stable web reliability gates.
- Items 9-11 depend on expanded usage and scenario volume.
- Items 12-15 depend on matured contracts and release process.
