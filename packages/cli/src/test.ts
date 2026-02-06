import test from "node:test";
import assert from "node:assert/strict";
import { stableStringify } from "./io";

test("stableStringify sorts keys", () => {
  const s = stableStringify({ b: 1, a: 2 });
  assert.ok(s.indexOf("\"a\"") < s.indexOf("\"b\""));
});
