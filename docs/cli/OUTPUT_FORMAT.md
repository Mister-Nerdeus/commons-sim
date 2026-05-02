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

## `challenge-score`
stdout: stable JSON challenge result with:
- `benchmarkId`
- `benchmarkClassId`
- `totalScore`
- `componentScores`
- `readinessGates`
- `capacity`
- `cashflow`
- `stressResults`
- `inputHash`
- `outputHash`
- `validation`

stderr: `hash=<sha256>` for deterministic result tracking.

## `challenge-batch`
stdout JSON:
```json
{
  "benchmarkId": "balanced-48",
  "benchmarkClassId": "balanced-48",
  "count": 1,
  "results": []
}
```
Results are sorted by descending `totalScore`.

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
- `CHALLENGE_BENCHMARK_ERROR`
- `CHALLENGE_SUBMISSION_ERROR`
- `RUNTIME_ERROR`
