import { runSensitivity, simulateScenario } from "@commons-sim/engine";
import { migrateProjectManifest, type ProjectManifest } from "@commons-sim/shared";
import { loadProjectManifest, loadScenario, saveProjectManifest, stableStringify } from "./io.js";
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
  project-save <scenario.json> <manifest.json>
  project-load <manifest.json>
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

  throw new CliError("USAGE_ERROR", `Unknown command: ${cmd}`, EXIT_USAGE);
} catch (error) {
  writeError(error);
}
