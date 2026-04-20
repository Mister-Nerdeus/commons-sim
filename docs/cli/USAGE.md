# CLI Usage

## Commands

### Validate
```bash
node packages/cli/dist/main.js validate <scenario.json>
```
Returns exit code `0` with validation metadata when valid.

### Run
```bash
node packages/cli/dist/main.js run <scenario.json> [--seed N]
```
Prints deterministic simulation output JSON to stdout and output hash to stderr.

### Compare
```bash
node packages/cli/dist/main.js compare <a.json> <b.json> [--seed N]
```
Prints hash comparison JSON with equality flag.

## Exit Codes
- `0`: success
- `2`: usage error (unknown command, invalid flags)
- `3`: parse/validation error
- `4`: runtime/file-system error

## Canonical Fixture Flow
1. `node packages/cli/dist/main.js validate examples/scenarios/basic.json`
2. `node packages/cli/dist/main.js run examples/scenarios/basic.json`
3. `node packages/cli/dist/main.js compare examples/scenarios/basic.json examples/scenarios/high-service.json`

## Smoke Test List
- Validate baseline fixture.
- Run baseline fixture.
- Compare baseline vs candidate fixture.
- Run with invalid path and verify non-zero exit + machine-readable error.
