import { createHash } from "node:crypto";

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value), null, 2);
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      output[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return output;
  }
  return value;
}
