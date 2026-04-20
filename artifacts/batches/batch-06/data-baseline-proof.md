# Staging Data Baseline Proof

## Commands

```powershell
node scripts/data/capture-staging-baseline.mjs --source-sha ed51496b3a37d9a8094d6ad2a7c4f13d3bb21488 --operator codex-batch06
node scripts/data/reset-staging-from-baseline.mjs --operator codex-batch06
```

## Observed Output

- Baseline capture result: `ok=true`, `sourceSha=ed51496b3a37d9a8094d6ad2a7c4f13d3bb21488`
- Reset result: `ok=true`, reset log appended with timestamp and source SHA

## Artifact Files

- `artifacts/data/staging-baseline/baseline-record.json`
- `artifacts/data/staging-baseline/reset-log.md`
