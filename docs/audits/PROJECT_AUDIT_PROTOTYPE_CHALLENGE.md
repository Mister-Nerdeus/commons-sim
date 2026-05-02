# Project Audit: Prototype Challenge Direction

Date: 2026-05-01

## Scope

This audit reviews the current repository against the goal of turning `commons-sim` into a game-like challenge where players compete to design community prototypes with credible real-world planning value.

Reviewed areas:

- monorepo structure and package responsibilities
- simulation model and schema contracts
- web game/challenge surface
- CLI and automation
- CI, determinism, and test posture
- scenario library and calibration readiness
- ethics, governance, and real-world safety constraints

## Executive Finding

The project has a strong deterministic planning foundation, but it is not yet a real-world prototype engineering game.

Current strengths are reproducibility, simple contracts, auditable equations, and a working comparison UI. Current gaps are real supply/demand modeling, capital financing, resource constraints, benchmark fairness, game persistence, real leaderboard infrastructure, empirical calibration, and web test coverage.

The next phase should not add more cosmetic game UI first. It should build the missing engineering substrate that makes a winning score mean something.

## Current State

Implemented:

- deterministic TypeScript engine
- schema-validated scenario contract
- CLI run/compare/validate/sensitivity/project commands
- baseline and canonical scenarios
- deterministic hash/golden checks
- comparison-first web workspace
- starter planning wizard
- export/load project manifest flow
- initial Prototype Challenge Mode scoring and leaderboard

Not implemented:

- calibrated demand model
- capacity-constrained supply model
- capex financing and procurement timelines
- land/building/site constraints
- real energy/water/sewer peak-load modeling
- local price datasets
- multi-player backend, authentication, submissions, anti-cheat, seasons, or persistent leaderboard
- real prototype package export with bill of materials, staffing roster, permits, and risk register
- automated web interaction tests

## P0 Findings

### P0-1: Challenge leaderboard compares unlike projects

The current challenge mode ranks scenarios with very different household counts against a single baseline. This allows smaller scenarios to score highly because they carry less total demand and often less equipment burden.

Observed sample ranking from current deterministic outputs:

| Scenario | Households | Avg cost/HH | Score | Ready |
|---|---:|---:|---:|---|
| `starter-balanced-24` | 24 | 170.18 | 84.3 | true |
| `cn-003-lean-service-36` | 36 | 95.51 | 81.7 | true |
| `starter-lean-18` | 18 | 66.38 | 81.3 | true |
| `baseline-48` | 48 | 231.20 | 55.5 | false |
| `cn-002-family-heavy-64` | 64 | 336.51 | 46.3 | false |

This is not a valid competition. Players must compete inside a defined benchmark class, for example:

- `small-24`
- `balanced-48`
- `family-heavy-64`
- `dense-96`
- `rural-36`
- `retrofit-48`

Required fix:

- Add `challengeBenchmarkId` to scenario or challenge submission metadata.
- Score only against the matching benchmark.
- Show separate leaderboards per benchmark.
- Reject or mark invalid any submission that changes locked benchmark constraints.

### P0-2: The score is not yet tied to enough engineering reality

Current score components use existing high-level outputs: cost, reserves, participation, tiers, and burnout. This is useful for a prototype UI, but not enough for real-world claims.

Missing engineering gates:

- utility capacity
- kitchen throughput
- laundry machine capacity
- staffing shift coverage
- procurement lead time
- replacement schedule
- permitting risk
- operating reserve adequacy under shock scenarios
- local labor market feasibility
- supply chain availability

Required fix:

- Add capacity-constrained submodels before allowing public competition claims.
- Winners should be called "prototype candidates", not "proven solutions".

### P0-3: No persistence or anti-cheat for real competition

The web app runs fully client-side. There is no durable submission object, account identity, signed run hash, judging queue, season state, or audit trail.

Required fix:

- Add a submission artifact format.
- Add deterministic server-side re-simulation before leaderboard acceptance.
- Add signed hashes for scenario input, engine version, model version, and benchmark version.
- Add human review workflow for top prototypes.

### P0-4: Public claims around crime reduction would be unsafe

The project can model safety proxies, but it cannot claim crime reduction without external validation. Crime outcomes are affected by many social, legal, economic, demographic, and environmental variables outside the current model.

Allowed language:

- "safety and resilience proxies"
- "resident stewardship coverage"
- "lighting and visibility coverage"
- "youth/family support capacity"
- "emergency response readiness"
- "stress-reduction assumptions"

Disallowed language until validated:

- "this reduces crime by X%"
- "this prevents violence"
- "this guarantees safe neighborhoods"

## P1 Findings

### P1-1: Scenario schema is too narrow for real prototype work

The current schema covers households, shared service participation, service tiers, wages, utilities, equipment, and reserves. It does not yet represent:

- land/site constraints
- building types
- kitchens, washers, vehicles, batteries, water storage, pumps, security lighting, access systems
- service-level agreements
- staffing roles and shifts
- procurement and replacement schedules
- local market prices
- grants, debt, equity, dues, subsidies, or hardship funds
- household affordability and rent burden
- equity/fairness across household types

### P1-2: Demand is average monthly demand only

Average monthly demand is not enough for real operations. Communities fail at peaks:

- meal rush windows
- laundry weekend bottlenecks
- water/sewer peak flow
- staff sick days
- emergency outages
- school/work commuting windows

Required fix:

- Add daily/weekly profile curves.
- Add peak demand and queueing models.
- Add service-level failure metrics.

### P1-3: Supply is implicit, not modeled

Demand exists, but supply capacity is mostly implied by labor and equipment annualized cost. A real game needs players to buy, staff, and operate capacity.

Required supply-side entities:

- assets with throughput, uptime, lifespan, maintenance, lead time, and replacement cost
- staff roles with skills, shifts, wages, absence rates, and supervision overhead
- vendors with price, lead time, reliability, and local availability
- facilities with space, utility hookups, capacity, compliance constraints

### P1-4: Cost model lacks financing and cash timing

The current equipment model annualizes capex. Real prototypes need cashflow:

- upfront capital
- debt service
- grants
- operating subsidy
- reserve contributions
- replacement reserve
- insurance
- permits and professional services
- contingency
- inflation/escalation

### P1-5: Web tests are still missing

The web package test script is still a placeholder. This is already documented in the risk register and test strategy.

Required fix:

- Add Vitest and React Testing Library for component behavior.
- Add Playwright for workflow and screenshot checks.
- Cover challenge leaderboard, readiness gates, manifest load, starter creation, and export.

### P1-6: CLI does not expose challenge scoring

A serious competition should support reproducible scoring outside the browser.

Required fix:

- Add `challenge-score <benchmark.json> <submission.json>`.
- Add `challenge-batch <benchmark.json> <directory>`.
- Emit stable JSON with hashes and gate results.

### P1-7: No calibrated datasets

The docs correctly acknowledge coefficients are placeholders. Before real-world use, the model needs calibration data sources for:

- labor productivity
- utility consumption
- equipment throughput
- local wage rates
- energy rates
- water/sewer rates
- capex quotes
- maintenance costs
- staffing absence/turnover

## P2 Findings

### P2-1: Game design needs explicit player verbs

Current UI exposes scenario selection and starter templates. It does not yet give gamers interesting choices.

Needed player actions:

- choose benchmark community
- allocate budget
- buy assets
- design services
- set staffing schedules
- negotiate participation
- choose governance rules
- plan reserves
- run stress tests
- submit ranked prototype

### P2-2: The game needs seasons, constraints, and judging

A good competition needs locked rules:

- same benchmark for all players in a season
- locked local price pack
- locked regulations pack
- budget cap
- minimum service requirements
- hidden stress tests
- public leaderboard
- reviewed finalists

### P2-3: "Family values" needs operational definition

The software should not encode a vague moral score. It should measure concrete support outcomes:

- household affordability
- meal reliability
- childcare/eldercare coverage where applicable
- schedule stability
- shared burden reduction
- youth activity capacity
- multi-generational household support
- hardship reserve availability

## Recommended Product Reframe

Position the app as:

> A competitive civic engineering game where players design shared-service community prototypes under real constraints, then the system tests cost, capacity, resilience, fairness, and implementation readiness.

Avoid positioning it as:

> A simulator that proves social outcomes or guarantees lower crime.

## Required Architecture Changes

### Challenge Package

Create a dedicated challenge domain layer:

- `packages/shared/src/challengeSchema.ts`
- `packages/shared/src/challengeScoring.ts`
- `packages/shared/src/challengeSubmission.ts`
- `packages/engine/src/capacity.ts`
- `packages/engine/src/cashflow.ts`
- `packages/engine/src/stress.ts`

### Web App

Add views:

- Challenge browser
- Build mode
- Stress test panel
- Submission review
- Benchmark-specific leaderboard
- Prototype package export

### CLI

Add commands:

- `challenge-score`
- `challenge-batch`
- `challenge-validate`
- `challenge-export`

### Data

Add versioned data packs:

- `data/prices/us-default-2026.json`
- `data/equipment/community-services-v1.json`
- `data/benchmarks/*.json`
- `data/regulatory/us-generic-planning-v1.json`

## Recommended Execution Order

1. Freeze benchmark classes and challenge rules.
2. Add challenge schema and benchmark/submission contracts.
3. Add CLI scoring for benchmark vs submission.
4. Split web leaderboard by benchmark class.
5. Add capacity model for kitchen/laundry/staffing.
6. Add cashflow/financing model.
7. Add stress tests.
8. Add prototype package export.
9. Add web tests and screenshot checks.
10. Add server-side verification and persistent leaderboard.

## Audit Verdict

Current project maturity for the full vision:

- deterministic planning core: strong
- web proof of concept: moderate
- real-world engineering model: early
- game loop: early
- competition integrity: not ready
- public real-world claims: not ready

The project is worth continuing, but the next work should be technical model depth and challenge contracts, not more UI polish.
