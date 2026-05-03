import {
  assessCapacity,
  assessCashflow,
  runChallengeStressTests,
  runSensitivity,
  simulateScenario,
} from "@commons-sim/engine";
import {
  ChallengeResultSchema,
  migrateProjectManifest,
  scorePrototypeChallenge,
  validateChallengeSubmission,
  type ChallengeBenchmark,
  type ChallengeReadinessGate,
  type ChallengeResult,
  type ChallengeSubmission,
  type ModuleRegistry,
  type ProjectManifest,
} from "@commons-sim/shared";
import {
  loadChallengeBenchmark,
  loadChallengeSubmission,
  loadModuleRegistry,
  loadProjectManifest,
  loadScenario,
  saveProjectManifest,
  stableStringify,
} from "./io.js";
import fs from "node:fs";
import path from "node:path";
import { sha256 } from "./hash.js";

const [, , cmd, ...args] = process.argv;

const EXIT_OK = 0;
const EXIT_USAGE = 2;
const EXIT_VALIDATION = 3;
const EXIT_RUNTIME = 4;

type CliErrorCode =
  | "USAGE_ERROR"
  | "SCENARIO_NOT_FOUND"
  | "SCENARIO_PARSE_ERROR"
  | "SCENARIO_VALIDATION_ERROR"
  | "CHALLENGE_BENCHMARK_ERROR"
  | "CHALLENGE_SUBMISSION_ERROR"
  | "MODULE_REGISTRY_VALIDATION_ERROR"
  | "RUNTIME_ERROR";

class CliError extends Error {
  code: CliErrorCode;
  exitCode: number;

  constructor(code: CliErrorCode, message: string, exitCode: number) {
    super(message);
    this.code = code;
    this.exitCode = exitCode;
  }
}

function usage() {
  console.log(`commons-sim

Commands:
  run <scenario.json> [--seed N]
  compare <a.json> <b.json> [--seed N]
  validate <scenario.json>
  sensitivity <scenario.json>
  challenge-score <benchmark.json> <submission.json>
  challenge-batch <benchmark.json> <submissions-dir>
  project-save <scenario.json> <manifest.json>
  project-load <manifest.json>
  registry-validate <registry.json>
`);
  process.exit(EXIT_USAGE);
}

function getFlag(name: string) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return args[i + 1];
}

if (!cmd) usage();

function loadScenarioStrict(filePath: string) {
  try {
    return loadScenario(filePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/ENOENT/i.test(message)) {
      throw new CliError("SCENARIO_NOT_FOUND", `Scenario file not found: ${filePath}`, EXIT_RUNTIME);
    }
    if (/Unexpected token|JSON/i.test(message)) {
      throw new CliError("SCENARIO_PARSE_ERROR", `Scenario JSON parse failed: ${filePath}`, EXIT_VALIDATION);
    }
    if (/ZodError|invalid|Required/i.test(message)) {
      throw new CliError("SCENARIO_VALIDATION_ERROR", `Scenario validation failed: ${filePath}`, EXIT_VALIDATION);
    }
    throw new CliError("RUNTIME_ERROR", message, EXIT_RUNTIME);
  }
}

function parseSeedOverride(flagValue: string | undefined) {
  if (flagValue === undefined) return undefined;
  const value = Number(flagValue);
  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    throw new CliError("USAGE_ERROR", `Invalid --seed value: ${flagValue}`, EXIT_USAGE);
  }
  return value;
}

function writeError(error: unknown) {
  if (error instanceof CliError) {
    console.error(
      JSON.stringify(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        null,
        2,
      ),
    );
    process.exit(error.exitCode);
  }

  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ error: { code: "RUNTIME_ERROR", message } }, null, 2));
  process.exit(EXIT_RUNTIME);
}

try {
  if (cmd === "run") {
    const file = args[0];
    if (!file) usage();
    const seedOverride = parseSeedOverride(getFlag("--seed"));
    const s = loadScenarioStrict(file);
    const scenario = seedOverride !== undefined ? { ...s, seed: seedOverride } : s;
    const out = simulateScenario(scenario);
    const text = stableStringify(out);
    console.log(text);
    console.error(`hash=${sha256(text)}`);
    process.exit(EXIT_OK);
  }

  if (cmd === "compare") {
    const aFile = args[0];
    const bFile = args[1];
    if (!aFile || !bFile) usage();
    const seedOverride = parseSeedOverride(getFlag("--seed"));
    const a = loadScenarioStrict(aFile);
    const b = loadScenarioStrict(bFile);
    const ao = simulateScenario(seedOverride !== undefined ? { ...a, seed: seedOverride } : a);
    const bo = simulateScenario(seedOverride !== undefined ? { ...b, seed: seedOverride } : b);
    const ah = sha256(stableStringify(ao));
    const bh = sha256(stableStringify(bo));
    console.log(JSON.stringify({ a: ah, b: bh, equal: ah === bh }, null, 2));
    process.exit(EXIT_OK);
  }

  if (cmd === "validate") {
    const file = args[0];
    if (!file) usage();
    const scenario = loadScenarioStrict(file);
    console.log(
      JSON.stringify(
        {
          ok: true,
          scenarioId: scenario.id,
          version: scenario.version,
        },
        null,
        2,
      ),
    );
    process.exit(EXIT_OK);
  }

  if (cmd === "sensitivity") {
    const file = args[0];
    if (!file) usage();
    const scenario = loadScenarioStrict(file);
    const out = runSensitivity(scenario);
    const text = stableStringify(out);
    console.log(text);
    console.error(`hash=${sha256(text)}`);
    process.exit(EXIT_OK);
  }

  if (cmd === "challenge-score") {
    const benchmarkFile = args[0];
    const submissionFile = args[1];
    if (!benchmarkFile || !submissionFile) usage();

    const benchmark = loadChallengeBenchmarkStrict(benchmarkFile);
    const submission = loadChallengeSubmissionStrict(submissionFile);
    const result = buildChallengeResult(benchmark, submission);
    const text = stableStringify(result);
    console.log(text);
    console.error(`hash=${sha256(text)}`);
    process.exit(result.validation.ok ? EXIT_OK : EXIT_VALIDATION);
  }

  if (cmd === "challenge-batch") {
    const benchmarkFile = args[0];
    const submissionsDir = args[1];
    if (!benchmarkFile || !submissionsDir) usage();

    const benchmark = loadChallengeBenchmarkStrict(benchmarkFile);
    const files = fs
      .readdirSync(path.resolve(submissionsDir))
      .filter((file) => file.endsWith(".json"))
      .sort();
    const results = files
      .map((file) => buildChallengeResult(benchmark, loadChallengeSubmissionStrict(path.join(submissionsDir, file))))
      .sort((a, b) => b.totalScore - a.totalScore || a.submissionId.localeCompare(b.submissionId));
    const text = stableStringify({
      benchmarkId: benchmark.id,
      benchmarkClassId: benchmark.benchmarkClassId,
      count: results.length,
      results,
    });
    console.log(text);
    console.error(`hash=${sha256(text)}`);
    process.exit(results.every((result) => result.validation.ok) ? EXIT_OK : EXIT_VALIDATION);
  }

  if (cmd === "project-save") {
    const scenarioFile = args[0];
    const manifestFile = args[1];
    if (!scenarioFile || !manifestFile) usage();

    const scenario = loadScenarioStrict(scenarioFile);
    const now = new Date().toISOString();
    const manifest: ProjectManifest = {
      manifestVersion: 1,
      projectId: scenario.id,
      projectTitle: scenario.title,
      createdAtUtc: now,
      updatedAtUtc: now,
      sourceBranch: "develop",
      scenario,
      metadata: {
        notes: "Saved via CLI project-save",
        engineVersion: "0.1.0",
      },
    };

    saveProjectManifest(manifestFile, manifest);
    console.log(JSON.stringify({ ok: true, saved: manifestFile, projectId: manifest.projectId }, null, 2));
    process.exit(EXIT_OK);
  }

  if (cmd === "project-load") {
    const manifestFile = args[0];
    if (!manifestFile) usage();

    const parsed = loadProjectManifest(manifestFile);
    const migrated = migrateProjectManifest(parsed);
    const output = simulateScenario(migrated.manifest.scenario);
    console.log(
      JSON.stringify(
        {
          ok: true,
          migratedFrom: migrated.migratedFrom,
          projectId: migrated.manifest.projectId,
          scenarioId: output.scenarioId,
          summary: output.summary,
        },
        null,
        2,
      ),
    );
    process.exit(EXIT_OK);
  }

  if (cmd === "registry-validate") {
    const registryFile = args[0];
    if (!registryFile) usage();
    const registry = loadModuleRegistryStrict(registryFile);
    console.log(
      JSON.stringify(
        {
          ok: true,
          registryId: registry.registryId,
          moduleCount: registry.modules.length,
        },
        null,
        2,
      ),
    );
    process.exit(EXIT_OK);
  }

  throw new CliError("USAGE_ERROR", `Unknown command: ${cmd}`, EXIT_USAGE);
} catch (error) {
  writeError(error);
}

function loadChallengeBenchmarkStrict(filePath: string): ChallengeBenchmark {
  try {
    return loadChallengeBenchmark(filePath);
  } catch (error) {
    throw loadChallengeError("CHALLENGE_BENCHMARK_ERROR", `Challenge benchmark load failed: ${filePath}`, error);
  }
}

function loadChallengeSubmissionStrict(filePath: string): ChallengeSubmission {
  try {
    return loadChallengeSubmission(filePath);
  } catch (error) {
    throw loadChallengeError("CHALLENGE_SUBMISSION_ERROR", `Challenge submission load failed: ${filePath}`, error);
  }
}

function loadModuleRegistryStrict(filePath: string): ModuleRegistry {
  try {
    return loadModuleRegistry(filePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new CliError(
      "MODULE_REGISTRY_VALIDATION_ERROR",
      `Module registry validation failed: ${filePath}: ${message}`,
      EXIT_VALIDATION,
    );
  }
}

function loadChallengeError(code: CliErrorCode, prefix: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return new CliError(code, `${prefix}: ${message}`, EXIT_VALIDATION);
}

function buildChallengeResult(benchmark: ChallengeBenchmark, submission: ChallengeSubmission): ChallengeResult {
  const validation = validateChallengeSubmission(benchmark, submission);
  const baselineOutput = simulateScenario(benchmark.lockedScenario);
  const candidateOutput = simulateScenario(submission.proposedScenario);
  const challengeScore = scorePrototypeChallenge(
    baselineOutput.summary,
    candidateOutput.summary,
    submission.proposedScenario,
  );
  const capacity = assessCapacity(submission.proposedScenario);
  const cashflow = assessCashflow(submission.proposedScenario, candidateOutput.summary, benchmark.budgetCapUsd);
  const stressResults = runChallengeStressTests(submission.proposedScenario);
  const targetGates = benchmarkTargetGates(benchmark, candidateOutput.summary, submission.proposedScenario.householdCount);
  const readinessGates: ChallengeReadinessGate[] = [
    ...challengeScore.gates,
    ...targetGates,
    {
      key: "locked-fields",
      label: "Locked benchmark fields unchanged",
      passed: validation.ok,
      detail: validation.ok
        ? "Submission preserves locked benchmark fields."
        : `Submission changed ${validation.violations.length} locked field(s).`,
    },
    {
      key: "capacity",
      label: "Capacity covers modeled demand",
      passed: capacity.passed,
      detail: capacity.passed ? "All modeled service demand clears capacity." : "One or more services exceed capacity.",
    },
    {
      key: "capital-budget",
      label: "Upfront capital fits budget cap",
      passed: cashflow.budgetCapPassed,
      detail: cashflow.budgetCapPassed
        ? "Upfront capital stays inside the benchmark budget cap."
        : "Upfront capital exceeds the benchmark budget cap.",
    },
  ];
  const outputEnvelope = {
    candidateOutput,
    capacity,
    cashflow,
    stressResults,
  };
  const prototypePackageReady = readinessGates.every((gate) => gate.passed);

  return ChallengeResultSchema.parse({
    resultVersion: 1,
    submissionId: submission.id,
    benchmarkId: benchmark.id,
    benchmarkClassId: benchmark.benchmarkClassId,
    engineVersion: candidateOutput.meta.engineVersion,
    modelVersion: candidateOutput.meta.modelVersion,
    scoringVersion: benchmark.scoringProfileId,
    inputHash: sha256(stableStringify({ benchmark, submission })),
    outputHash: sha256(stableStringify(outputEnvelope)),
    totalScore: validation.ok ? challengeScore.totalScore : 0,
    maxScore: challengeScore.maxScore,
    componentScores: challengeScore.components,
    readinessGates,
    capacity,
    cashflow,
    stressResults,
    prototypePackageReady,
    validation,
  });
}

function benchmarkTargetGates(
  benchmark: ChallengeBenchmark,
  summary: ReturnType<typeof simulateScenario>["summary"],
  householdCount: number,
): ChallengeReadinessGate[] {
  const reserveMonths = summary.avgCostPerHouseholdUsd <= 0 ? 0 : summary.reserveEndUsd / (summary.avgCostPerHouseholdUsd * householdCount);
  return [
    {
      key: "target-cost",
      label: "Benchmark cost target",
      passed: summary.avgCostPerHouseholdUsd <= benchmark.minimumTargets.maxAvgCostPerHouseholdUsd,
      detail: `Average household cost must be <= ${benchmark.minimumTargets.maxAvgCostPerHouseholdUsd.toFixed(2)}.`,
    },
    {
      key: "target-reserve",
      label: "Benchmark reserve target",
      passed: reserveMonths >= benchmark.minimumTargets.minReserveMonths,
      detail: `Reserve months proxy is ${reserveMonths.toFixed(2)}; target is ${benchmark.minimumTargets.minReserveMonths.toFixed(2)}.`,
    },
    {
      key: "target-burnout",
      label: "Benchmark burnout target",
      passed: summary.avgBurnoutIndex <= benchmark.minimumTargets.maxBurnoutIndex,
      detail: `Burnout proxy must be <= ${benchmark.minimumTargets.maxBurnoutIndex.toFixed(2)}.`,
    },
  ];
}
