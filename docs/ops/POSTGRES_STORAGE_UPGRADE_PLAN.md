# Postgres Storage Upgrade Plan

## Purpose

The server now supports both atomic JSON files for local development and Postgres for production-style durability. JSON remains useful for fast development, but public competition workflows should use Postgres or a managed relational equivalent.

This upgrade introduces the initial Postgres storage layer with migrations, local Docker wiring, backup/restore scripts, and storage health/metrics endpoints.

## Why Upgrade

File-backed JSON storage has limits:

- no multi-writer transaction safety
- no robust query model
- no indexed leaderboard queries
- no durable rate-limit coordination across replicas
- no built-in backup/restore workflow
- no migration framework
- no audit log guarantees
- not suitable for horizontally scaled API nodes

## Implemented Tables

Initial schema:

- `identities`
- `seasons`
- `leaderboard_entries`
- `audit_events`

## Required Capabilities

### Migrations

- versioned schema migrations in `packages/server/migrations`
- repeatable local/staging/prod migration command via `pnpm --filter @commons-sim/server db:migrate`
- CI migration dry-run remains open
- rollback guidance for failed migrations

### Backups

- operator backup script via `pnpm --filter @commons-sim/server backup:postgres`
- restore script via `pnpm --filter @commons-sim/server restore:postgres <backup.sql>`
- automated daily backups
- point-in-time recovery where provider supports it
- restore drill artifact per release cycle
- documented retention policy

### Operational Monitoring

Track:

- API request count and latency
- submission acceptance/rejection count
- database query latency
- leaderboard query latency
- failed auth count
- rate-limit count
- finalist review actions
- database connection saturation
- backup health

### Data Integrity

Requirements:

- transaction around submission acceptance and leaderboard insert
- immutable audit event for every admin review action
- stable result hashes stored with submission input hash
- unique constraint on `(season_id, benchmark_id, submission_id)`
- foreign keys between submissions, identities, seasons, and results

## Migration Path

1. Introduce storage interface in `packages/server`. Done.
2. Move current JSON file code behind `JsonStorageAdapter`. Done.
3. Add `PostgresStorageAdapter`. Done.
4. Add migration runner. Done.
5. Add local Docker Compose Postgres service. Done.
6. Add backup/restore scripts. Done.
7. Add CI migration check. Open.
8. Switch staging to Postgres. Open.
9. Run parity check between JSON and Postgres adapters. Open.
10. Promote production only after restore drill passes. Open.

## Local Development

Local service is wired in `docker-compose.yml`:

```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_DB: commons_sim
  POSTGRES_USER: commons_sim
  POSTGRES_PASSWORD: commons_sim_local
  ports:
    - "15432:5432"
```

Run the API against local Postgres:

```bash
docker compose up -d commons-sim-postgres commons-sim-api
curl http://127.0.0.1:8787/health
```

## Open Production Decisions

- managed Postgres provider and region
- backup retention policy
- point-in-time recovery objective
- migration approval process
- alert thresholds for API errors, database saturation, and backup health
- whether signed anonymous identities should move to full accounts before public launch

Default recommendation: managed Postgres with automated daily backups, point-in-time recovery, and separate staging/prod databases.
