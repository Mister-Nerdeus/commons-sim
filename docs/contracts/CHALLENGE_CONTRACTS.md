# Challenge Contracts

Source of truth: `packages/shared/src/challengeSchema.ts`.

## Challenge Benchmark

A benchmark defines the locked problem players compete against.

Key fields:

- `benchmarkVersion`
- `id`
- `title`
- `benchmarkClassId`
- `lockedScenario`
- `pricePackId`
- `equipmentCatalogId`
- `regulatoryPackId`
- `scoringProfileId`
- `budgetCapUsd`
- `minimumTargets`

Locked fields currently enforced:

- `version`
- `horizonMonths`
- `timestep`
- `householdCount`
- `householdMix`
- `occupantsPerType`
- `wageModel`
- `utilities`

## Challenge Submission

A submission declares a proposed scenario for one benchmark.

Key fields:

- `submissionVersion`
- `id`
- `benchmarkId`
- `title`
- `authorDisplayName`
- `createdAtUtc`
- `proposedScenario`
- `designNotes`
- `declaredRisks`

## Challenge Result

A result is the deterministic scored artifact emitted by CLI challenge commands.

Key fields:

- `submissionId`
- `benchmarkId`
- `benchmarkClassId`
- `engineVersion`
- `modelVersion`
- `scoringVersion`
- `inputHash`
- `outputHash`
- `totalScore`
- `componentScores`
- `readinessGates`
- `capacity`
- `cashflow`
- `stressResults`
- `prototypePackageReady`
- `validation`

## Validation Coverage

- Contract tests: `packages/shared/src/challengeSchema.test.ts`
- CLI integration tests: `packages/cli/src/integration.test.ts`
- Example benchmark: `examples/challenges/benchmarks/balanced-48.benchmark.json`
- Example submission: `examples/challenges/submissions/balanced-48-baseline.submission.json`
