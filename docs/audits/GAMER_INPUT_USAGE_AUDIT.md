# Gamer Input and Usage Audit

Date: 2026-05-02

## Scope

This audit reviews `commons-sim` from the perspective of a gamer/player trying to compete in Prototype Challenge Mode.

Reviewed surfaces:

- web challenge mode
- benchmark and submission contracts
- server identity and submission flow
- CLI scoring flow
- leaderboard and finalist review workflow
- Docker/API deployment path
- documentation needed for player onboarding

## Executive Finding

The project now has the infrastructure required for a legitimate competition loop: locked benchmarks, deterministic scoring, server-side re-simulation, signed anonymous identities, seasons, leaderboards, and finalist review.

It is not yet a satisfying game for ordinary players. The current player input model is still developer-oriented: JSON submissions, starter templates, static scenario variants, and CLI/API workflows. A gamer can inspect rankings, but cannot yet naturally build a prototype through an interactive budget/equipment/staffing interface.

## Current Player Journey

### Web

Available:

- choose a baseline and candidate scenario
- apply starter templates
- save/load project manifests
- view Prototype Challenge Mode
- switch benchmark classes
- click leaderboard entries
- inspect score components and readiness gates

Missing:

- true build mode
- budget allocation controls
- equipment catalog
- staffing controls
- service policy controls
- supply/vendor choices
- stress-test interaction
- submission to API from the browser
- signed anonymous identity creation in UI
- season browser
- finalist queue browser

### CLI

Available:

- validate scenarios
- run simulation
- compare scenarios
- run sensitivity
- score one benchmark/submission pair
- batch score submissions

This is useful for developers and power users, but not for gamers.

### API

Available:

- create signed anonymous identity
- list benchmarks and seasons
- submit signed challenge entries
- serve leaderboards
- manage finalist review through admin token

Missing:

- browser client integration
- durable managed database
- account recovery
- abuse operations
- public moderation tooling

## Input Model Audit

### Good Inputs

The current contracts correctly protect benchmark fairness:

- household count is locked
- household mix is locked
- occupant assumptions are locked
- wage assumptions are locked
- utility prices are locked
- horizon and timestep are locked

This prevents players from winning by shrinking the problem.

### Weak Inputs

Current player-adjustable inputs are still too coarse:

- participation rates
- service tiers
- equipment list
- reserve policy

These are not enough to feel like a strategy/engineering game. Players need more concrete choices:

- buy kitchen equipment with throughput and maintenance tradeoffs
- buy laundry machines with cycle capacity and downtime risk
- hire staff with wages, shifts, skills, and burnout risk
- choose supply vendors with cost, lead time, reliability, and local availability
- choose financing plans with debt service and reserve requirements
- allocate hardship funds or subsidies
- choose optional programs such as childcare, youth activity coverage, eldercare, repair/tool library, safety lighting, transport, energy backup

## Game Design Audit

### Current Game Loop

The implemented loop is:

1. choose benchmark
2. compare preset candidate scenarios
3. inspect score and gates
4. submit signed JSON/API entry
5. review leaderboard
6. admin can mark finalists

### Target Game Loop

The target gamer loop should be:

1. choose season
2. choose benchmark
3. receive fixed budget and constraints
4. build prototype through interactive controls
5. run simulation
6. see failures and repair suggestions
7. run visible stress tests
8. submit to leaderboard
9. watch rank change
10. top entries enter finalist review

## UX Findings

### P0: No Browser Submission Flow

The API supports signed submissions, but the web app does not create identities or submit to the API.

Required work:

- Add "Create Player Identity" flow.
- Store the player secret locally in browser storage with clear reset behavior.
- Add "Submit to Season" action.
- Show submission accepted/rejected state.
- Show leaderboard entries from API, not only in-memory scenario variants.

### P0: No Build Mode

Players cannot directly construct a prototype. They can only select or load scenarios.

Required work:

- Add builder panels:
  - budget
  - equipment
  - staffing
  - services
  - reserves
  - risk notes
- Generate `ChallengeSubmission` from the builder.

### P0: Score Is Visible, But Not Actionable Enough

Readiness gates explain pass/fail, but the UI does not yet tell players how to improve.

Required work:

- Add repair hints for each failed gate.
- Add score delta preview when changing inputs.
- Add "why did rank change?" explanation.

### P1: Season and Finalist Views Are API-Only

Seasons and finalist review exist in the server, but web users cannot see them.

Required work:

- Add season selector.
- Add finalists tab.
- Add admin-only review page later.

### P1: Player Identity Is Too Technical

The signed anonymous identity flow is appropriate for infrastructure, but not player-friendly.

Required work:

- Hide HMAC signing from players.
- Generate identity in browser.
- Show recoverability limits.
- Add optional export/import of player identity.

## Security and Integrity Findings

### P0: Managed Storage Operations Are Still Needed

The server now has an initial Postgres storage adapter with migrations, local Docker wiring, backup/restore scripts, and storage health/metrics. That is a substantial step beyond local file-backed storage, but it is not the same as a managed production database operation.

The next upgrade should provision a managed Postgres deployment or equivalent managed database with automated backups, restore drills, alerting, secret rotation, and operational monitoring.

Required production capabilities:

- durable relational records for identities, seasons, submissions, results, reviews, and audit events
- database migrations
- transaction safety
- backups and restore drills
- operational dashboards
- retention policy
- data export
- admin audit log

### P1: Anonymous Identity Is Useful But Not Recoverable

If the player loses their local secret, they lose submission continuity.

Options:

- signed anonymous identity remains default for low-friction play
- optional account linking later
- export/import player key
- rotate compromised player secret

### P1: Rate Limiting Is In-Memory

Rate limiting resets on process restart and does not coordinate across replicas.

Required production work:

- move rate limit counters to database or Redis-compatible managed store
- track per identity and per IP
- add moderation controls

## Recommended Implementation Order

1. Build browser identity and signed submission flow.
2. Add API-backed leaderboard and season browser to web.
3. Add build mode with budget/equipment/staffing controls.
4. Add repair hints and score delta previews.
5. Provision managed Postgres operations with automated backups, restore drills, and alerting.
6. Add admin finalist review UI.
7. Add production monitoring and abuse operations.

## Gamer Readiness Verdict

Current status:

- Developer competition: usable
- Gamer competition: early prototype
- Public production competition: not ready

The next highest-value product work is web build mode plus API-backed submissions. The next highest-value infrastructure work is managed Postgres operations: automated backups, restore drills, alerting, secret rotation, and production runbooks.
