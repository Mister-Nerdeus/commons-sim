import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool, PoolClient } from "pg";

export async function runPostgresMigrations(pool: Pool, migrationsDir = defaultMigrationsDir()): Promise<string[]> {
  await pool.query(`
    create table if not exists schema_migrations (
      version text primary key,
      applied_at_utc timestamptz not null default now()
    )
  `);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const applied: string[] = [];

  for (const file of files) {
    const version = path.basename(file, ".sql");
    const existing = await pool.query("select 1 from schema_migrations where version = $1", [version]);
    if (existing.rowCount && existing.rowCount > 0) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    const client = await pool.connect();
    try {
      await applyMigration(client, version, sql);
      applied.push(version);
    } finally {
      client.release();
    }
  }

  return applied;
}

function defaultMigrationsDir(): string {
  const thisDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(thisDir, "../migrations");
}

async function applyMigration(client: PoolClient, version: string, sql: string): Promise<void> {
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query("insert into schema_migrations (version) values ($1)", [version]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}
