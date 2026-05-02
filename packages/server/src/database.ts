import fs from "node:fs";
import path from "node:path";
import { stableStringify } from "./json.js";

export function readJsonFile<T>(filePath: string, fallback: T): T {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) return fallback;
  return JSON.parse(fs.readFileSync(abs, "utf-8")) as T;
}

export function writeJsonFileAtomic(filePath: string, value: unknown): void {
  const abs = path.resolve(filePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const temp = `${abs}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, `${stableStringify(value)}\n`, "utf-8");
  fs.renameSync(temp, abs);
}
