# commons-sim

**commons-sim** is a deterministic planning simulator for shared-service residential communities.

It models:
- households + resident mix
- shared services (meals, laundry, cleaning)
- labor + wages + staffing overhead
- utilities (electric, water, sewer)
- equipment capex → depreciation + maintenance
- reserves and governance levers

This is a **planning engine first**, a game layer second.

## Goals (Phase 1)
- Deterministic: same inputs + seed → same outputs
- Transparent “actual cost” accounting
- Labor realism: hours, overhead, coverage pressure (burnout proxy)
- Scenario-based comparisons (48 households baseline)
- No backend required for v1 (runs in Node + browser)

## Quickstart

### Install
```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm install --frozen-lockfile
pnpm build
```

### Run baseline scenario (CLI)
```bash
pnpm --filter @commons-sim/cli build
node packages/cli/dist/main.js run scenarios/baseline-48.json
```

### Determinism commands
```bash
pnpm determinism:init   # local only, writes/updates goldens
pnpm determinism:check  # check only, used by CI
```

## Packages
- `@commons-sim/shared` — scenario schema/contracts (Zod) + types
- `@commons-sim/engine` — deterministic simulation engine (pure functions)
- `@commons-sim/cli` — scenario runner + determinism gate
- `@commons-sim/web` — dashboard (Phase 1: no auth, no backend)

## Credibility rules
- Every assumption must be explicit and documented in `docs/MODEL.md`
- Any output-changing change must be caught by determinism CI

## Program control
- [Top 15 locked backlog](docs/program/TOP_15_BACKLOG.md)
- [Batch plan and stop/go gate](docs/program/BATCH_PLAN.md)
- [Issue dependency map](docs/program/DEPENDENCY_MAP.md)
- [Batch audit template](docs/program/BATCH_AUDIT_TEMPLATE.md)
- [Change-control rules](docs/program/CHANGE_CONTROL.md)
- [Branch governance and required checks](docs/program/BRANCH_GOVERNANCE.md)
- [Branch topology and promotion authority](docs/program/BRANCH_TOPOLOGY.md)
- [Branch protection policy](docs/program/BRANCH_PROTECTION_POLICY.md)
- [Environment topology and branch mapping](docs/program/ENVIRONMENT_TOPOLOGY.md)
- [Environment policy and deployment mapping](docs/program/ENVIRONMENT_POLICY.md)
- [Develop to staging promotion contract](docs/program/DEVELOP_TO_STAGING_PROMOTION.md)
- [Staging to main release contract](docs/program/STAGING_TO_MAIN_RELEASE.md)
- [Local setup and runtime contract](docs/setup/LOCAL_SETUP.md)
- [Engine submodel architecture](docs/model/ENGINE_SUBMODELS.md)
- [Semantic fix log](docs/model/SEMANTIC_FIXES.md)
- [Input contract](docs/contracts/INPUT_CONTRACT.md)
- [Output contract](docs/contracts/OUTPUT_CONTRACT.md)
- [Migration notes](docs/contracts/MIGRATION_NOTES.md)
- [Project manifest contract](docs/contracts/PROJECT_MANIFEST.md)
- [Project migration contract](docs/contracts/PROJECT_MIGRATIONS.md)
- [Staging data policy](docs/data/STAGING_DATA_POLICY.md)
- [Staging refresh runbook](docs/data/STAGING_REFRESH_RUNBOOK.md)
- [Environment parity gates](docs/gates/ENV_PARITY_GATES.md)
- [Canonical scenario library](docs/scenarios/SCENARIO_LIBRARY.md)
- [Staging benchmark matrix](docs/scenarios/STAGING_BENCHMARK_MATRIX.md)
- [Determinism policy](docs/testing/DETERMINISM.md)
- [Test strategy and coverage policy](docs/testing/TEST_STRATEGY.md)
- [CLI usage](docs/cli/USAGE.md)
- [CLI output format](docs/cli/OUTPUT_FORMAT.md)
- [Web workspace spec](docs/product/WEB_WORKSPACE_SPEC.md)
- [Onboarding and explainability](docs/product/ONBOARDING_AND_EXPLAINABILITY.md)
- [Model assumptions registry](docs/model/ASSUMPTIONS.md)
- [Sensitivity review](docs/model/SENSITIVITY_REVIEW.md)
- [ADR-001 Runtime and determinism](docs/adr/ADR-001-runtime-determinism.md)
- [ADR-002 Engine contract](docs/adr/ADR-002-engine-contract.md)
- [ADR-003 CLI contract](docs/adr/ADR-003-cli-contract.md)
- [Alpha report template](docs/product/ALPHA_REPORT_TEMPLATE.md)
- [Sample exported report](docs/product/SAMPLE_EXPORTED_REPORT.md)
- [Batch 4 alpha audit](docs/audits/BATCH_04_ALPHA_AUDIT.md)
- [Batch 5 governance and environment audit](docs/audits/BATCH_05_AUDIT.md)
- [Batch 6 promotion and staging-data audit](docs/audits/BATCH_06_AUDIT.md)
- [Batch 7 parity/scenario/sensitivity audit](docs/audits/BATCH_07_AUDIT.md)
- [Batch 8 persistence/onboarding audit](docs/audits/BATCH_08_AUDIT.md)
- [Next 15 backlog](docs/program/NEXT_15_BACKLOG.md)
- [Next 15 backlog v4](docs/program/NEXT_15_BACKLOG_V4.md)
- [Risk register](docs/program/RISK_REGISTER.md)
- [Codex issue template](.github/ISSUE_TEMPLATE/codex-issue.md)
- [Pull request template](.github/pull_request_template.md)
