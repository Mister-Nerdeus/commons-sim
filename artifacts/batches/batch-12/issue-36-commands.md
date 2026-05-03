# Issue 36 Commands

Commands run:

```powershell
pnpm --filter @commons-sim/shared build
pnpm --filter @commons-sim/shared test
pnpm build
pnpm test
pnpm determinism:check
```

Result: pass.

Notes:

- Valid semantic primitive fixture: `examples/semantic-primitives/example-valid.json`
- Invalid semantic primitive fixture: `examples/semantic-primitives/example-invalid.json`
- Valid variable registry fixture: `examples/variables/core-human-settlement.variables.json`
- Invalid variable registry fixture: `examples/variables/invalid-variable.examples.json`
- No engine behavior changed.
