# Issue 38 Commands

Commands run:

```powershell
pnpm --filter @commons-sim/shared build
pnpm --filter @commons-sim/shared test
pnpm build
pnpm test
pnpm determinism:check
```

Result: pass.

Valid fixtures:

- `examples/modules/community-meals/terminals.valid.json`
- `examples/graphs/community-services.problem-graph.json`
- `examples/graphs/community-services.solution-graph.json`
- `examples/graphs/community-services.world-graph.json`

Invalid fixtures:

- `examples/modules/community-meals/terminals.invalid.json`
- `examples/graphs/invalid-link.invalid.json`

Statement: No graph compiler was implemented.
