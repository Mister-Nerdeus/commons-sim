# Staging Refresh Runbook

## Purpose

Standard operator procedure for staging baseline capture and refresh/reset.

## Prerequisites

- Working tree clean on `develop`.
- `node` available.
- Confirm target branch SHA for baseline source.

## Baseline Capture Procedure

1. Run:

```powershell
node scripts/data/capture-staging-baseline.mjs --source-sha <main-sha> --operator <name>
```

2. Verify updated file:
   - `artifacts/data/staging-baseline/baseline-record.json`
3. Commit baseline artifact update with reason in commit message.

## Staging Reset Procedure

1. Run:

```powershell
node scripts/data/reset-staging-from-baseline.mjs --operator <name>
```

2. Verify reset log:
   - `artifacts/data/staging-baseline/reset-log.md`
3. Attach reset log reference to promotion or incident PR.

## Refresh Cadence

- Minimum: before each release-candidate cycle into `staging`.
- Additional refresh required after schema or seed contract changes.

## Failure Handling

- If capture or reset fails, block promotion to `staging`.
- Open incident note and include command output + timestamp.
