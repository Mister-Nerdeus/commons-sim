# Prototype Challenge Mode Technical Specification

## Purpose

Prototype Challenge Mode turns `commons-sim` into a competitive engineering game. Players design community operating prototypes under shared constraints. The system scores each design on cost, capacity, resilience, fairness, sustainability, and readiness for a real pilot review.

This is not a tool for guaranteeing social outcomes. It is a transparent planning and competition environment.

## Product Goals

1. Make shared-service community design playable.
2. Force players to solve real constraints: budget, labor, utilities, capacity, supply, reserves, and risk.
3. Produce prototype packages that a human team could review.
4. Keep all scoring deterministic, explainable, and reproducible.
5. Prevent leaderboard wins from exploiting weak assumptions.

## Core Game Loop

1. Player selects a benchmark challenge.
2. Player receives locked constraints:
   - household mix
   - geography/price pack
   - site limitations
   - regulatory assumptions
   - budget cap
   - minimum service targets
3. Player designs a prototype:
   - services
   - staffing
   - equipment
   - supply vendors
   - governance policies
   - reserve and financing strategy
4. Player runs deterministic simulation.
5. Player reviews score breakdown and failed gates.
6. Player iterates.
7. Player submits to leaderboard.
8. System re-simulates submission using locked engine/model/benchmark versions.
9. Top submissions become prototype candidates for human review.

## Benchmark Classes

Leaderboards must be separated by benchmark. A submission cannot compete against a benchmark with different locked demand constraints.

Initial benchmark classes:

| Benchmark ID | Households | Intent |
|---|---:|---|
| `small-24` | 24 | starter small community |
| `balanced-48` | 48 | mixed residential baseline |
| `family-heavy-64` | 64 | family-support stress case |
| `rural-36` | 36 | lower-density utility and transport case |
| `retrofit-48` | 48 | existing-property retrofit case |
| `dense-96` | 96 | larger shared-services capacity case |

## Locked Benchmark Fields

Players must not be allowed to edit:

- household count
- household mix
- occupant assumptions
- horizon and timestep
- local wage assumptions
- local utility prices
- local price pack ID
- baseline site constraints
- regulatory pack ID
- scoring version
- benchmark minimum service requirements

Players may edit:

- service design
- equipment choices
- staffing schedule
- operating policies
- financing strategy
- reserve strategy
- procurement choices
- optional community programs

## Proposed Data Model

### Challenge Benchmark

```ts
type ChallengeBenchmark = {
  benchmarkVersion: 1;
  id: string;
  title: string;
  benchmarkClassId: string;
  lockedScenario: Scenario;
  pricePackId: string;
  equipmentCatalogId: string;
  regulatoryPackId: string;
  scoringProfileId: string;
  budgetCapUsd: number;
  minimumTargets: {
    maxAvgCostPerHouseholdUsd: number;
    minReserveMonths: number;
    maxBurnoutIndex: number;
    minMealCoverage: number;
    minLaundryCoverage: number;
  };
};
```

### Challenge Submission

```ts
type ChallengeSubmission = {
  submissionVersion: 1;
  id: string;
  benchmarkId: string;
  title: string;
  authorDisplayName: string;
  createdAtUtc: string;
  proposedScenario: Scenario;
  designNotes: string;
  declaredRisks: string[];
};
```

### Challenge Result

```ts
type ChallengeResult = {
  resultVersion: 1;
  submissionId: string;
  benchmarkId: string;
  engineVersion: string;
  modelVersion: string;
  scoringVersion: string;
  inputHash: string;
  outputHash: string;
  totalScore: number;
  componentScores: ScoreComponent[];
  readinessGates: ReadinessGate[];
  stressResults: StressResult[];
  prototypePackageReady: boolean;
};
```

## Engineering Model Requirements

### Demand

Demand must move beyond monthly averages.

Required demand outputs:

- monthly totals
- daily profile
- hourly peak windows
- per-service queue pressure
- unmet demand
- participation sensitivity

Required services:

- meals
- laundry
- cleaning
- childcare support
- eldercare support
- transportation
- shared tools/repair
- energy resilience
- emergency support

### Supply

Supply must represent operational capacity.

Required supply entities:

- equipment units
- staff roles
- facilities
- vendors
- storage
- vehicles
- energy assets
- water/sewer assets

Required supply fields:

- throughput
- hours available
- uptime
- maintenance downtime
- lead time
- replacement cost
- required space
- utility draw
- compliance notes

### Cost

Required cost categories:

- labor
- utilities
- maintenance
- consumables
- insurance
- permits
- professional services
- equipment capex
- financing/debt service
- reserves
- contingency
- replacement reserve

Cost outputs:

- monthly operating cost
- cost per household
- upfront capital required
- debt service
- reserve trajectory
- five-year lifecycle cost
- low/base/high uncertainty range

### Cashflow

Required cashflow model:

- startup period
- procurement period
- operating months
- debt amortization
- grant/subsidy draws
- reserve contributions
- replacement events
- failure/shock events

### Stress Tests

Initial stress tests:

- utility price +20%
- wage +15%
- participation +20%
- equipment downtime
- staff absence
- one-month emergency demand spike
- capex overrun +15%

Leaderboard score should include hidden or semi-hidden stress tests to reduce overfitting.

## Scoring Specification

Total score: 100 points.

| Component | Points | Description |
|---|---:|---|
| Cost performance | 20 | lower cost without shifting burden unfairly |
| Capacity fit | 20 | demand served without excessive queues or unmet demand |
| Family support | 15 | measurable support for households with children, elders, and schedule pressure |
| Safety/resilience proxies | 15 | lighting, emergency readiness, staffing coverage, reserves, outage tolerance |
| Fairness | 10 | outcomes do not only benefit one household type |
| Sustainability | 10 | energy/water efficiency and lifecycle durability |
| Feasibility | 10 | procurement, staffing, permitting, and cashflow credibility |

Mandatory failure gates:

- reserve goes negative
- burnout exceeds threshold
- required demand is not served
- budget cap exceeded
- locked benchmark field changed
- input fails schema validation
- safety/regulatory red flag marked fatal

## Real-World Consequence Path

The game can have real-world consequences only through a controlled review path.

Recommended path:

1. Public leaderboard marks high-scoring entries.
2. Top entries enter "prototype candidate" queue.
3. Human reviewers inspect assumptions, risks, and exported package.
4. Selected candidates may become grant proposals, pilot studies, or community workshops.
5. Any field implementation requires local professional review.

The software must not auto-approve construction, staffing, safety, legal, or financing decisions.

## Anti-Cheat and Reproducibility

A valid leaderboard submission requires:

- benchmark ID
- scenario input hash
- price pack hash
- engine version
- model version
- scoring version
- deterministic output hash
- server-side re-simulation result

Rejected submissions:

- modified locked benchmark fields
- unknown data pack versions
- unsupported engine/model versions
- browser-only scores with no server-side verification
- missing design notes or declared risks

## Prototype Package Export

Winning submissions should export:

- executive summary
- benchmark and score
- bill of materials
- staffing plan
- operating budget
- capital budget
- reserve plan
- supply/vendor assumptions
- demand served and unmet demand
- stress test results
- implementation timeline
- risk register
- assumptions appendix

Formats:

- JSON for machine verification
- Markdown for review
- CSV for budgets
- PDF later after content stabilizes

## Implementation Milestones

### Milestone 1: Fair Challenge Contracts

- Add benchmark schema.
- Add submission schema.
- Add result schema.
- Add CLI validation and scoring.
- Split web leaderboard by benchmark.

### Milestone 2: Capacity and Cashflow

- Add capacity submodels.
- Add procurement/capex fields.
- Add cashflow and financing.
- Add stress tests.

### Milestone 3: Playable Builder

- Add budget allocation UI.
- Add equipment/staffing controls.
- Add stress test panel.
- Add failed-gate repair hints.

### Milestone 4: Competition Infrastructure

- Add backend persistence. (Initial file-backed proof implemented.)
- Add server-side re-simulation. (Initial API implemented.)
- Add accounts or signed anonymous submissions. (Signed anonymous identity implemented.)
- Add seasons and reviewed finalist queue. (Initial season/review workflow implemented.)

### Milestone 5: Calibration

- Add local price packs.
- Add equipment catalog.
- Add empirical references.
- Add uncertainty bands.

## Acceptance Criteria

Prototype Challenge Mode is not production-ready until:

- every leaderboard entry belongs to one benchmark class
- scoring is available in CLI and web
- server-side re-simulation is available for public competition
- web interaction tests cover the challenge flow
- model docs explain every score component
- all P0 audit findings are resolved
