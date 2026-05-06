# Issue 57 Commands

```text
pnpm --filter @commons-sim/engine build
pnpm --filter @commons-sim/engine test
```

Observed: supported V2 fixture compiles from attached Scenario V1, unsupported Dream Mode returns warnings, and unsupported Challenge Mode blocks.

Non-claims: no full graph compiler, no module execution runtime, no product binding, no BOM/report export, no UI workflow.
