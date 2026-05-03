import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const databaseUrl = process.env.COMMONS_SIM_DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Set COMMONS_SIM_DATABASE_URL or DATABASE_URL before running backup:postgres.");
  process.exit(1);
}

const outputPath =
  process.argv[2] ??
  path.join("artifacts", "backups", `commons-sim-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const result = spawnSync("pg_dump", ["--no-owner", "--no-privileges", "--format=plain", "--file", outputPath, databaseUrl], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Wrote Postgres backup: ${outputPath}`);
