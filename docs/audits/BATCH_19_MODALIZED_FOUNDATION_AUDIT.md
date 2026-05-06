# Batch 19 Modalized Foundation Audit

## Scope

Issues #51-#58 were reviewed as a modalized freeform foundation: local evidence integrity, mode policy, ProjectManifestV2, LayoutGraph, deterministic generation, AI proposal contracts, compile adapter, and builder shell.

## Issue Rollup

- #51 adds runtime and current-HEAD local validation gates.
- #52 adds mode policy and severity-aware validation contracts.
- #53 adds ProjectManifestV2 and V1-to-V2 migration.
- #54 adds deterministic geometry and LayoutGraph schemas.
- #55 adds deterministic polygon village generator output.
- #56 adds AI proposal lifecycle and provenance.
- #57 adds a narrow V2-to-ScenarioV1 adapter.
- #58 adds a builder shell while preserving the old scenario workspace.

## Required Questions

- Evidence gates trustworthy: yes, runtime and SHA checks are machine-readable and nonzero on failure.
- Dream Mode permissive: yes, Dream warnings do not block save.
- Challenge/Professional mode-scoped: yes, strict blockers are mode-specific.
- V2 separates design and simulation: yes, `compiledScenario` is optional.
- LayoutGraph design storage only: yes, docs and code make no engine claim.
- AI proposal-plane only: yes, draft proposals are not truth-plane approval.
- Compile adapter narrow: yes, only attached Scenario V1 compiles.
- Builder shell non-overclaiming: yes, docs and smoke evidence call it a shell.

## Validation Summary

Package-level checks observed:

- `pnpm --filter @commons-sim/shared build`: pass
- `pnpm --filter @commons-sim/shared test`: pass
- `pnpm --filter @commons-sim/engine build`: pass
- `pnpm --filter @commons-sim/engine test`: pass
- `pnpm --filter @commons-sim/web build`: pass

Full local validation is recorded in `artifacts/controls/local-validation/latest.json` after final gate execution.

## Gamer Freedom Findings

Dream Mode permits incomplete ProjectManifestV2 and LayoutGraph fixtures. The builder defaults to Dream Mode and shows warnings without disabling save/export.

## Mode Boundary Findings

Challenge Mode can block locked benchmark violations. Professional Mode can block provenance gaps. Strict mode behavior is data-contract scoped and does not leak into Dream Mode.

## Evidence Integrity Findings

Runtime policy is explicit in `package.json`, Docker images, and the runtime proof artifact. Local validation currentness is checked against `git rev-parse HEAD`.

## Explicit Non-Claims

- No shared schema changes alter Scenario V1 simulation output.
- No full graph compiler exists.
- No AI provider integration exists.
- No professional/buildability approval exists.
- No server persistence exists for builder projects.
- No production drag/drop editor exists.

## Known Gaps

- Browser smoke evidence remains manual until Playwright is added.
- LayoutGraph precision and topology rules will need follow-up.
- AI provider and proposal review workflows are not implemented.
- Compile adapter does not compile module graphs or layout graphs.

## GO / NO-GO Decision

GO for modalized foundation contracts and shell, with strict non-claims preserved.

Next recommended issue: add browser interaction tests, screenshot evidence, and API-backed project persistence.
