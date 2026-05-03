import { createStorageFromEnv } from "./storageFactory.js";

const storage = await createStorageFromEnv({
  storageDir: process.env.COMMONS_SIM_STORAGE_DIR ?? "artifacts/server/leaderboards",
  backend: process.env.COMMONS_SIM_STORAGE_BACKEND ?? "postgres",
  databaseUrl: process.env.COMMONS_SIM_DATABASE_URL ?? process.env.DATABASE_URL,
  migrationsDir: process.env.COMMONS_SIM_MIGRATIONS_DIR,
});

const health = await storage.health();
if (!health.ok) {
  console.error(JSON.stringify(health, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(health, null, 2));
}
await storage.close?.();
