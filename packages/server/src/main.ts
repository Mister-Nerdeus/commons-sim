import path from "node:path";
import { createApiServer } from "./server.js";

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "127.0.0.1";
const benchmarkDir = process.env.COMMONS_SIM_BENCHMARK_DIR ?? path.resolve("examples/challenges/benchmarks");
const storageDir = process.env.COMMONS_SIM_STORAGE_DIR ?? path.resolve("artifacts/server/leaderboards");
const adminToken = process.env.COMMONS_SIM_ADMIN_TOKEN;

const server = createApiServer({ benchmarkDir, storageDir, adminToken });

server.listen(port, host, () => {
  console.log(`commons-sim server listening on http://${host}:${port}`);
  console.log(`benchmarkDir=${benchmarkDir}`);
  console.log(`storageDir=${storageDir}`);
  console.log(`adminEndpoints=${adminToken ? "enabled" : "disabled"}`);
});
