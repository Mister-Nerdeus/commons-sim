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

### Sensitivity
```bash
node packages/cli/dist/main.js sensitivity <scenario.json>
```
Prints deterministic perturbation summaries for RC review.

### Challenge Score
```bash
node packages/cli/dist/main.js challenge-score <benchmark.json> <submission.json>
```
Re-simulates a challenge submission against a locked benchmark and prints deterministic score, validation, capacity, cashflow, stress-test, and readiness-gate results.

### Challenge Batch
```bash
node packages/cli/dist/main.js challenge-batch <benchmark.json> <submissions-dir>
```
Scores every JSON submission in a directory against one benchmark and prints ranked results.

### Project Save/Load
```bash
node packages/cli/dist/main.js project-save <scenario.json> <manifest.json>
node packages/cli/dist/main.js project-load <manifest.json>
```
Saves and loads v1 project manifests with schema validation.

### Registry Validate
```bash
node packages/cli/dist/main.js registry-validate <registry.json>
```
Validates a module registry and emits a machine-readable result envelope.

### Graph Link Validate
```bash
node packages/cli/dist/main.js graph-link-validate <graph.json> <compatibility-rules.json> <template.json...>
```
Runs static graph link validation against supplied generic templates and compatibility rules. The command emits the shared `GraphLinkValidationResult` shape and exits nonzero only for error-level issues. Adapter-required links are warning-level results.

## Exit Codes
- `0`: success
- `2`: usage error (unknown command, invalid flags)
- `3`: parse/validation error
- `4`: runtime/file-system error

## Canonical Fixture Flow
1. `node packages/cli/dist/main.js validate examples/scenarios/basic.json`
2. `node packages/cli/dist/main.js run examples/scenarios/basic.json`
3. `node packages/cli/dist/main.js compare examples/scenarios/basic.json examples/scenarios/high-service.json`
4. `node packages/cli/dist/main.js challenge-score examples/challenges/benchmarks/balanced-48.benchmark.json examples/challenges/submissions/balanced-48-baseline.submission.json`
5. `node packages/cli/dist/main.js graph-link-validate examples/graphs/link-validation.valid.json examples/interfaces/compatibility-rules.valid.json examples/modules/generic/community-meals.template.json examples/modules/generic/laundry.template.json`

## Smoke Test List
- Validate baseline fixture.
- Run baseline fixture.
- Compare baseline vs candidate fixture.
- Run sensitivity on baseline fixture.
- Save and load manifest round-trip for baseline fixture.
- Score baseline challenge submission against the balanced-48 benchmark.
- Batch score challenge submissions in a directory.
- Validate graph links statically.
- Run with invalid path and verify non-zero exit + machine-readable error.
