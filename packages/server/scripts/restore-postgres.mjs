import { spawnSync } from "node:child_process";
import fs from "node:fs";

const databaseUrl = process.env.COMMONS_SIM_DATABASE_URL ?? process.env.DATABASE_URL;
const inputPath = process.argv[2];

if (!databaseUrl) {
  console.error("Set COMMONS_SIM_DATABASE_URL or DATABASE_URL before running restore:postgres.");
  process.exit(1);
}

if (!inputPath || !fs.existsSync(inputPath)) {
  console.error("Usage: pnpm --filter @commons-sim/server restore:postgres <backup.sql>");
  process.exit(1);
}

const result = spawnSync("psql", [databaseUrl, "--file", inputPath, "--set", "ON_ERROR_STOP=1"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Restored Postgres backup: ${inputPath}`);
