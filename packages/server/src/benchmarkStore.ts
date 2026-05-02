import fs from "node:fs";
import path from "node:path";
import { ChallengeBenchmarkSchema, type ChallengeBenchmark } from "@commons-sim/shared";

export function listBenchmarks(benchmarkDir: string): ChallengeBenchmark[] {
  const dir = path.resolve(benchmarkDir);
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => loadBenchmark(path.join(dir, file)));
}

export function findBenchmark(benchmarkDir: string, benchmarkId: string): ChallengeBenchmark | undefined {
  return listBenchmarks(benchmarkDir).find((benchmark) => benchmark.id === benchmarkId);
}

function loadBenchmark(filePath: string): ChallengeBenchmark {
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return ChallengeBenchmarkSchema.parse(parsed);
}
