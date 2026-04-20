# Contributing

`commons-sim` is a deterministic planning simulator. Determinism and transparency are non-negotiable.

## Development setup
Requirements:
- Node 20.x (`20.19.0` pinned in `.nvmrc`)
- pnpm 9.x

Commands:
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test`
- `pnpm smoke:cli`
- `pnpm determinism:init` (local updates only)
- `pnpm determinism:check` (verification only)

Reference: `docs/setup/LOCAL_SETUP.md`

## PR rules
- Any model change MUST update docs (`docs/ASSUMPTIONS.md`, `docs/MODEL.md` where applicable)
- Any output change MUST be intentional and accompanied by updated determinism snapshots
- Keep modules pure (no hidden state, no network calls)
- Add tests for equations and edge cases
- Include issue contract, acceptance gates, and evidence in PR template sections
- Follow branch and check requirements in `docs/program/BRANCH_GOVERNANCE.md`

## Labels
- Priority: `P0`, `P1`, `P2`
- Modules: `module:water`, `module:sewer`, `module:energy`, `module:food`, `module:labor`
- Areas: `model`, `docs`, `infra`, `ui`
