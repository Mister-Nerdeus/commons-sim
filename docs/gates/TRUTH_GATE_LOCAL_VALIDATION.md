# Truth-Gate Local Validation

Local validation is the formal merge evidence for this repo. GitHub Actions can still provide signal, but it is not the merge gate.

The truth gate proves two things:

1. The validation ran under the runtime declared in root `package.json`.
2. The local validation artifact points at the commit currently being reviewed.

`scripts/controls/verify-runtime-version.mjs` reads root `engines.node` and `engines.pnpm`, compares them with the active local runtime, writes a machine-readable runtime proof, and exits nonzero on mismatch.

`scripts/controls/verify-local-validation-current.mjs` reads `artifacts/controls/local-validation/latest.json`, compares its `gitSha` to `git rev-parse HEAD`, and exits nonzero when evidence is stale.

`scripts/controls/run-local-validation.mjs` runs the runtime proof before install/build/test/determinism checks, writes `latest.json`, then verifies that the generated evidence belongs to the current `HEAD`.

Non-claims:

- This gate does not prove professional design validity.
- This gate does not replace code review.
- This gate does not permit validation under undeclared runtimes.
