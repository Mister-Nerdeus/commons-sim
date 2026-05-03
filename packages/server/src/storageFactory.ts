import { JsonStorageAdapter } from "./jsonStorage.js";
import { PostgresStorageAdapter } from "./postgresStorage.js";
import type { StorageAdapter } from "./storage.js";

export type StorageFactoryOptions = {
  storageDir: string;
  backend?: string;
  databaseUrl?: string;
  migrationsDir?: string;
};

export async function createStorageFromEnv(options: StorageFactoryOptions): Promise<StorageAdapter> {
  const backend = (options.backend ?? process.env.COMMONS_SIM_STORAGE_BACKEND ?? "json").toLowerCase();
  if (backend === "json" || backend === "file" || backend === "filesystem") {
    return new JsonStorageAdapter(options.storageDir);
  }
  if (backend === "postgres" || backend === "postgresql") {
    const connectionString = options.databaseUrl ?? process.env.COMMONS_SIM_DATABASE_URL ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Postgres storage requires COMMONS_SIM_DATABASE_URL or DATABASE_URL.");
    }
    return PostgresStorageAdapter.create({
      connectionString,
      migrationsDir: options.migrationsDir ?? process.env.COMMONS_SIM_MIGRATIONS_DIR,
    });
  }
  throw new Error(`Unsupported COMMONS_SIM_STORAGE_BACKEND: ${backend}`);
}
