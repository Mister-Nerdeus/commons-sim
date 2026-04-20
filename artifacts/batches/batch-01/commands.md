# batch-01 command verification log

Date: 2026-04-19
Environment: local terminal, Node v22.16.0 shell (project pins Node 20.x)

## Commands executed
1. `pnpm install --frozen-lockfile`
2. `pnpm build`
3. `pnpm test`
4. `pnpm smoke:cli`
5. `pnpm determinism:baseline`

## Results summary
- Install: PASS
- Build: PASS
- Test: PASS
- Smoke CLI: PASS
- Determinism baseline: PASS (`hash=695be456953c6cc19d822437413d33089ee30b54105430178a96365389dcf5dd`)

## Notes
- Shell emits engine warnings because local Node is 22.x while project contract requires 20.x.
- CI is pinned to Node 20.19.0 and uses frozen lockfile install.
