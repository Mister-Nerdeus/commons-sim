# Server API

The server package provides deterministic server-side re-simulation for Prototype Challenge submissions. It is intentionally file-backed for the current phase.

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
- `COMMONS_SIM_STORAGE_DIR`: durable JSON database/storage directory, default `artifacts/server/leaderboards`
- `COMMONS_SIM_ADMIN_TOKEN`: enables protected admin endpoints when set

Docker:

```bash
docker compose build commons-sim-api
docker compose up -d commons-sim-api
```

## Endpoints

### `GET /health`

Returns:

```json
{ "ok": true }
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
- stores valid results in the durable JSON database under `COMMONS_SIM_STORAGE_DIR`

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

## Current Limitations

- Anonymous identity is HMAC-signed but not a substitute for full account management.
- Rate limiting is in-memory per process.
- Durable storage is an atomic file-backed JSON database, not Postgres/S3/etc.
- Public deployments still need secret rotation, backups, monitoring, TLS termination, and abuse operations.
