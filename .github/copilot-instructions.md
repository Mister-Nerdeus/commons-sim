# Copilot instructions for commons-sim

## Big picture
- Monorepo (pnpm workspace) with four parts: shared schema, engine, CLI, and web app.
  - Shared contracts live in [packages/shared/src/scenarioSchema.ts](packages/shared/src/scenarioSchema.ts).
  - Deterministic simulation logic lives in [packages/engine/src/simulate.ts](packages/engine/src/simulate.ts) and is intentionally pure/inspectable.
  - CLI loads scenarios, runs simulations, and hashes stable JSON output in [packages/cli/src/main.ts](packages/cli/src/main.ts).
  - Web app is a simple React/Vite dashboard that runs the engine directly in the browser, using the baseline scenario from [scenarios/baseline-48.json](scenarios/baseline-48.json) in [apps/web/src/ui/App.tsx](apps/web/src/ui/App.tsx).

## Determinism and credibility rules
- Determinism is a first‑class requirement: seed + scenario must yield identical outputs.
- Stable output hashing is done via `stableStringify()` in [packages/cli/src/io.ts](packages/cli/src/io.ts).
- The determinism gate lives in [packages/cli/src/determinismBaseline.ts](packages/cli/src/determinismBaseline.ts) and compares hashes against snapshot files in scenarios/.
- Any output‑changing change must be reflected in docs and pass determinism (see [docs/MODEL.md](docs/MODEL.md)).

## Key data flows
- Scenario JSON → Zod validation → engine output:
  - Scenario shape and constraints are enforced by `ScenarioSchema` in [packages/shared/src/scenarioSchema.ts](packages/shared/src/scenarioSchema.ts).
  - Engine uses `mulberry32()` RNG from [packages/engine/src/rng.ts](packages/engine/src/rng.ts) and monthly timestep constants in [packages/engine/src/simulate.ts](packages/engine/src/simulate.ts).
- Web app imports the same schema + engine (no backend) to keep output identical to CLI runs.

## Developer workflows (pnpm)
- Install/build all packages: `pnpm install` then `pnpm build` (root).
- Run baseline scenario via CLI: `pnpm --filter @commons-sim/cli build` then `node packages/cli/dist/main.js run scenarios/baseline-48.json`.
- Determinism snapshot check: `pnpm determinism:baseline` (root).
- Web dev server: `pnpm dev:web`.

## Project-specific conventions
- Phase 1 models prefer transparency over calibration; constants and units are documented in [docs/MODEL.md](docs/MODEL.md) and assumptions in [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md).
- Keep equations inspectable and deterministic; avoid hidden defaults outside the scenario schema.
- Scenario validation must stay in shared schema so CLI/web/engine remain aligned.
- When touching output shape, update both engine outputs and any snapshot expectations.
