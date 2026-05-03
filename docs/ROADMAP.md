# Roadmap

## Phase 1 (current)
- Engine + schema + scenarios
- Determinism CI
- Pages-hosted dashboard

## Phase 2
- Water module (demand, peak, pumps, storage)
- Sewer module (peak flow, I/I, septic/treatment constraints)
- Energy module (load curves, solar/storage, redundancy)
- Staffing coverage realism (shifts, minimum coverage, sick days)
- Sensitivity analysis
- Challenge benchmark contracts
- Prototype submission and scoring contracts
- Capacity-constrained supply models
- Cashflow, financing, and procurement timing

## Phase 3
- Calibration datasets
- Reporting exports (CSV/PDF)
- Scenario library templates
- Benchmark-specific leaderboards
- Stress tests and prototype package export

## Phase 4
- Server-side submission verification
- Persistent multiplayer leaderboard
- Seasonal challenge rules
- Human-reviewed prototype candidate workflow

## Phase 4 Status
- Initial file-backed server-side submission verification is implemented in `packages/server`.
- Signed anonymous identity, in-memory rate limiting, seasons, finalist review workflow, and Docker API wiring are implemented.
- Postgres storage adapter, SQL migrations, local Docker Postgres wiring, backup/restore scripts, and storage health/metrics are implemented.
- Production-grade account management, rate-limit persistence, managed database provisioning, provider backups, alerting, secret rotation, and human operations remain open.
