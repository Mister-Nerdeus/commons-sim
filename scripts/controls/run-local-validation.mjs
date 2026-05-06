import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const outPath = resolve(getArg("--out") ?? "artifacts/controls/local-validation/latest.json");
const operator = getArg("--operator") ?? process.env.USERNAME ?? process.env.USER ?? "unknown-operator";
const includeDocker = args.includes("--include-docker");

const commands = [
  ["node", ["scripts/controls/verify-runtime-version.mjs"]],
  ["node", ["--version"]],
  ["pnpm", ["--version"]],
  ["pnpm", ["install", "--frozen-lockfile"]],
  ["pnpm", ["build"]],
  ["pnpm", ["test"]],
  ["pnpm", ["smoke:cli"]],
  ["pnpm", ["determinism:check"]],
  ["pnpm", ["env:parity:check"]],
];

if (includeDocker) {
  commands.push(
    [
      "docker",
      ["build", "-f", "Dockerfile.local-validation", "-t", "commons-sim:local-validation", "."],
    ],
    ["docker", ["build", "-f", "Dockerfile", "-t", "commons-sim:web-local-validation", "."]],
    ["docker", ["build", "-f", "Dockerfile.api", "-t", "commons-sim:api-local-validation", "."]],
  );
}

const record = {
  schemaVersion: 1,
  evidenceType: "local-validation",
  generatedAtUtc: new Date().toISOString(),
  generatedBy: operator,
  includeDocker,
  gitSha: run("git", ["rev-parse", "HEAD"]).stdout.trim(),
  commands: [],
  ok: true,
};

for (const [command, commandArgs] of commands) {
  const startedAtUtc = new Date().toISOString();
  const started = performance.now();
  const result = run(command, commandArgs);
  const finishedAtUtc = new Date().toISOString();
  const entry = {
    command: [command, ...commandArgs].join(" "),
    exitCode: result.status,
    durationMs: Math.round(performance.now() - started),
    startedAtUtc,
    finishedAtUtc,
    stdoutTail: tail(result.stdout),
    stderrTail: tail(result.stderr),
  };

  record.commands.push(entry);

  if (result.status !== 0) {
    record.ok = false;
    writeJson(outPath, record);
    console.error(JSON.stringify(entry, null, 2));
    process.exit(result.status ?? 1);
  }
}

writeJson(outPath, record);

const currentProofResult = run("node", [
  "scripts/controls/verify-local-validation-current.mjs",
  "--evidence",
  outPath,
]);
const currentProofEntry = {
  command: `node scripts/controls/verify-local-validation-current.mjs --evidence ${outPath}`,
  exitCode: currentProofResult.status,
  durationMs: 0,
  startedAtUtc: new Date().toISOString(),
  finishedAtUtc: new Date().toISOString(),
  stdoutTail: tail(currentProofResult.stdout),
  stderrTail: tail(currentProofResult.stderr),
};
record.commands.push(currentProofEntry);

if (currentProofResult.status !== 0) {
  record.ok = false;
  writeJson(outPath, record);
  console.error(JSON.stringify(currentProofEntry, null, 2));
  process.exit(currentProofResult.status ?? 1);
}

writeJson(outPath, record);
console.log(JSON.stringify({ ok: record.ok, path: outPath, commands: record.commands.length }, null, 2));

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

function run(command, commandArgs) {
  if (process.platform === "win32") {
    return spawnSync([command, ...commandArgs].map(quoteShellArg).join(" "), {
      encoding: "utf8",
      shell: true,
      windowsHide: true,
    });
  }

  return spawnSync(command, commandArgs, {
    encoding: "utf8",
    shell: false,
    windowsHide: true,
  });
}

function quoteShellArg(value) {
  const stringValue = String(value);
  if (!/[\s"]/u.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '\\"')}"`;
}

function tail(value) {
  const lines = String(value ?? "").split(/\r?\n/);
  return lines.slice(Math.max(0, lines.length - 40)).join("\n").trim();
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
