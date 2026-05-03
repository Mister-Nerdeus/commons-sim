# Server API

The server package provides deterministic server-side re-simulation for Prototype Challenge submissions. It supports a local JSON backend for development and a Postgres backend for production-style deployments.

Package:

- `packages/server`

Run locally:

```bash
pnpm dev:server
```

Default URL:

- `http://127.0.0.1:8787`

Environment variables:

- `PORT`: API port, default `8787`
- `HOST`: bind host, default `127.0.0.1`; Docker uses `0.0.0.0`
- `COMMONS_SIM_BENCHMARK_DIR`: benchmark JSON directory, default `examples/challenges/benchmarks`
- `COMMONS_SIM_STORAGE_DIR`: durable JSON database/storage directory when `COMMONS_SIM_STORAGE_BACKEND=json`, default `artifacts/server/leaderboards`
- `COMMONS_SIM_STORAGE_BACKEND`: `json` or `postgres`, default `json`; Docker Compose uses `postgres`
- `COMMONS_SIM_DATABASE_URL` or `DATABASE_URL`: Postgres connection string when using the Postgres backend
- `COMMONS_SIM_MIGRATIONS_DIR`: optional migration SQL directory, default `packages/server/migrations` at runtime
- `COMMONS_SIM_PG_POOL_MAX`: Postgres connection pool size, default `10`
- `COMMONS_SIM_ADMIN_TOKEN`: enables protected admin endpoints when set

Docker:

```bash
docker compose build commons-sim-api
docker compose up -d commons-sim-postgres commons-sim-api
```

Migration command:

```bash
COMMONS_SIM_STORAGE_BACKEND=postgres DATABASE_URL=postgres://commons_sim:commons_sim_local@localhost:15432/commons_sim pnpm --filter @commons-sim/server db:migrate
```

Backup and restore:

```bash
DATABASE_URL=postgres://commons_sim:commons_sim_local@localhost:15432/commons_sim pnpm --filter @commons-sim/server backup:postgres
DATABASE_URL=postgres://commons_sim:commons_sim_local@localhost:15432/commons_sim pnpm --filter @commons-sim/server restore:postgres artifacts/backups/example.sql
```

## Endpoints

### `GET /health`

Returns:

```json
{
  "ok": true,
  "authRequired": true,
  "storage": {
    "backend": "postgres",
    "ok": true
  }
}
```

### `GET /metrics`

Requires `x-admin-token`.

Returns storage-level operational counters:

```json
{
  "backend": "postgres",
  "identities": 12,
  "seasons": 2,
  "leaderboardEntries": 35,
  "pendingReviews": 8,
  "finalists": 3
}
```

### `GET /benchmarks`

Returns every benchmark loaded from `COMMONS_SIM_BENCHMARK_DIR`.

### `GET /seasons`

Returns configured seasons. If no season database exists, the server creates a default `open-2026` season.

### `POST /identities`

Creates a signed anonymous identity.

Request:

```json
{ "label": "player-name" }
```

Response includes `identitySecret` once. Clients must store it locally and use it to sign submission requests.

### Signed Submission Headers

`POST /submissions` requires:

- `x-identity-id`
- `x-timestamp`
- `x-signature`

Signature:

```text
HMAC_SHA256(identitySecret, x-timestamp + "." + stableJson(requestBody))
```

### `POST /submissions`

Accepts a `ChallengeSubmission` JSON body.

Behavior:

- validates the submission schema
- verifies anonymous identity signature
- loads the matching benchmark
- assigns the active season
- re-simulates the proposed scenario server-side
- checks locked benchmark fields
- computes score, capacity, cashflow, stress tests, hashes, and readiness gates
- stores valid results in the configured durable storage backend

Status codes:

- `201`: accepted and stored
- `422`: schema-valid submission was simulated but failed locked-field validation
- `401`: missing or invalid identity signature
- `409`: no active season for the benchmark
- `429`: rate limited
- `404`: benchmark not found
- `400`: invalid JSON body

### `GET /leaderboards/:benchmarkId`

Returns stored challenge results for one benchmark, sorted by descending score.

Query:

- `seasonId`: optional season filter

### `GET /finalists/:benchmarkId`

Returns entries marked `finalist` or `approved` by admin review.

### `POST /admin/seasons`

Requires `x-admin-token`.

Creates or updates a season:

```json
{
  "seasonId": "spring-2026",
  "title": "Spring 2026",
  "benchmarkIds": ["balanced-48"],
  "startsAtUtc": "2026-01-01T00:00:00.000Z",
  "endsAtUtc": null,
  "active": true
}
```

### `POST /admin/review/:benchmarkId/:submissionId`

Requires `x-admin-token`.

Updates human review status:

```json
{
  "seasonId": "open-2026",
  "status": "finalist",
  "note": "Ready for human review."
}
```

Allowed statuses:

- `pending`
- `finalist`
- `approved`
- `rejected`

### `GET /admin/identities`

Requires `x-admin-token`.

Returns identity metadata without secrets.

## Storage

Implemented backends:

- `json`: atomic file-backed local storage, useful for development and demos
- `postgres`: relational storage with versioned SQL migrations, indexed leaderboard queries, and backup/restore scripts

## Current Limitations

- Anonymous identity is HMAC-signed but not a substitute for full account management.
- Rate limiting is in-memory per process.
- Postgres backup scripts require `pg_dump` and `psql` on the operator machine.
- Managed production still needs provider-level automated backups, point-in-time recovery, TLS termination, centralized logs, alerting, secret rotation, and abuse operations.
