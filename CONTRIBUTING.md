# Contributing

`commons-sim` is a deterministic planning simulator. Determinism and transparency are non-negotiable.

## Development setup
Requirements:
- Node 20+
- pnpm 9+

Commands:
- `pnpm install`
- `pnpm build`
- `pnpm test`
- `pnpm determinism:baseline`

## PR rules
- Any model change MUST update docs (`docs/ASSUMPTIONS.md`, `docs/MODEL.md` where applicable)
- Any output change MUST be intentional and accompanied by updated determinism snapshots
- Keep modules pure (no hidden state, no network calls)
- Add tests for equations and edge cases

## Labels
- Priority: `P0`, `P1`, `P2`
- Modules: `module:water`, `module:sewer`, `module:energy`, `module:food`, `module:labor`
- Areas: `model`, `docs`, `infra`, `ui`
