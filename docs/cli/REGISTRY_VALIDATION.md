# Registry Validation CLI

Command:

```powershell
node packages/cli/dist/main.js registry-validate examples/modules/registry.valid.json
```

Success output:

```json
{
  "ok": true,
  "registryId": "core-human-settlement-v1",
  "moduleCount": 3
}
```

Failure output:

```json
{
  "ok": false,
  "error": {
    "code": "MODULE_REGISTRY_VALIDATION_ERROR",
    "message": "..."
  }
}
```

Failure exits nonzero.

The command validates registry contract shape only. It does not execute modules, compile graphs, migrate scenarios, or bind real products.
