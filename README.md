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
pnpm install
pnpm build
```

### Run baseline scenario (CLI)
```bash
pnpm --filter @commons-sim/cli build
node packages/cli/dist/main.js run scenarios/baseline-48.json
```

### Determinism baseline (creates snapshot first run)
```bash
pnpm determinism:baseline
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
- [Codex issue template](.github/ISSUE_TEMPLATE/codex-issue.md)
- [Pull request template](.github/pull_request_template.md)
