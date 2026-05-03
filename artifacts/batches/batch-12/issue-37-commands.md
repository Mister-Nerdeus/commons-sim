# Issue 37 Commands

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

- `examples/modules/taxonomy.valid.json`
- `examples/modules/community-meals/problem-brief.json`
- `examples/modules/community-meals/solution-brief.generic.json`

Invalid fixture:

- `examples/modules/taxonomy.invalid.json`

Statement: Module contracts are schema-only; no module execution exists yet.
