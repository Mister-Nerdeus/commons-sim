import { simulateScenario } from "@commons-sim/engine";
import { loadScenario, stableStringify } from "./io";
import { sha256 } from "./hash";

const [, , cmd, ...args] = process.argv;

function usage() {
  console.log(`commons-sim

Commands:
  run <scenario.json> [--seed N]
  compare <a.json> <b.json> [--seed N]
`);
  process.exit(1);
}

function getFlag(name: string) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  return args[i + 1];
}

if (!cmd) usage();

if (cmd === "run") {
  const file = args[0];
  if (!file) usage();
  const seedOverride = getFlag("--seed");
  const s = loadScenario(file);
  const scenario = seedOverride ? { ...s, seed: Number(seedOverride) } : s;
  const out = simulateScenario(scenario);
  const text = stableStringify(out);
  console.log(text);
  console.error(`hash=${sha256(text)}`);
  process.exit(0);
}

if (cmd === "compare") {
  const aFile = args[0];
  const bFile = args[1];
  if (!aFile || !bFile) usage();
  const seedOverride = getFlag("--seed");
  const a = loadScenario(aFile);
  const b = loadScenario(bFile);
  const ao = simulateScenario(seedOverride ? { ...a, seed: Number(seedOverride) } : a);
  const bo = simulateScenario(seedOverride ? { ...b, seed: Number(seedOverride) } : b);
  const ah = sha256(stableStringify(ao));
  const bh = sha256(stableStringify(bo));
  console.log(JSON.stringify({ a: ah, b: bh, equal: ah === bh }, null, 2));
  process.exit(0);
}

usage();
