import path from "node:path";
import { createApiServer } from "./server.js";
import { createStorageFromEnv } from "./storageFactory.js";

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "127.0.0.1";
const benchmarkDir = process.env.COMMONS_SIM_BENCHMARK_DIR ?? path.resolve("examples/challenges/benchmarks");
const storageDir = process.env.COMMONS_SIM_STORAGE_DIR ?? path.resolve("artifacts/server/leaderboards");
const adminToken = process.env.COMMONS_SIM_ADMIN_TOKEN;

const storage = await createStorageFromEnv({
  storageDir,
  backend: process.env.COMMONS_SIM_STORAGE_BACKEND,
  databaseUrl: process.env.COMMONS_SIM_DATABASE_URL ?? process.env.DATABASE_URL,
  migrationsDir: process.env.COMMONS_SIM_MIGRATIONS_DIR,
});

const server = createApiServer({ benchmarkDir, storageDir, adminToken, storage });

server.listen(port, host, () => {
  console.log(`commons-sim server listening on http://${host}:${port}`);
  console.log(`benchmarkDir=${benchmarkDir}`);
  console.log(`storageDir=${storageDir}`);
  console.log(`storageBackend=${storage.backend}`);
  console.log(`adminEndpoints=${adminToken ? "enabled" : "disabled"}`);
});

async function shutdown(signal: string) {
  console.log(`received ${signal}; shutting down`);
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await storage.close?.();
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});
process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});
