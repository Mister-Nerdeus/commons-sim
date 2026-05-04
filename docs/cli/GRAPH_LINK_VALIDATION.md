# Graph Link Validation CLI

Command:

```powershell
node packages/cli/dist/main.js graph-link-validate <graph.json> <compatibility-rules.json> <template.json...>
```

Example:

```powershell
node packages/cli/dist/main.js graph-link-validate examples/graphs/link-validation.valid.json examples/interfaces/compatibility-rules.valid.json examples/modules/generic/community-meals.template.json examples/modules/generic/laundry.template.json
```

Success output uses the shared `GraphLinkValidationResult` shape:

```json
{
  "issueCount": 0,
  "issues": [],
  "ok": true
}
```

Validation errors are emitted on stdout with `ok: false` and exit code `3`.

Adapter-required links are warning-level issues. They count in `issueCount`, but the command exits `0` when no error-level issues are present.

Input load or schema failures use the stable stderr error code `GRAPH_LINK_VALIDATION_INPUT_ERROR`.

This command only runs static validation. It does not compile graphs, execute modules, schedule flows, infer adapters, mutate inputs, refactor the engine, migrate scenarios, or bind real products.
