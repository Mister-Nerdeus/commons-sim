# CLI Output Format

## `validate`
stdout JSON:
```json
{
  "ok": true,
  "scenarioId": "baseline-48",
  "version": 1
}
```

## `run`
stdout: stable JSON simulation output (`scenarioId`, `summary`, `series`, `meta`).
stderr: `hash=<sha256>` for deterministic tracking.

## `compare`
stdout JSON:
```json
{
  "a": "<sha256>",
  "b": "<sha256>",
  "equal": false
}
```

## Error Output (Machine-Detectable)
On failure, stderr emits JSON:
```json
{
  "error": {
    "code": "SCENARIO_NOT_FOUND",
    "message": "Scenario file not found: ..."
  }
}
```

Error codes currently emitted:
- `USAGE_ERROR`
- `SCENARIO_NOT_FOUND`
- `SCENARIO_PARSE_ERROR`
- `SCENARIO_VALIDATION_ERROR`
- `RUNTIME_ERROR`
