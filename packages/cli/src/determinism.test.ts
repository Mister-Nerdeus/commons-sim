import test from "node:test";
import assert from "node:assert/strict";
import { verifyHash } from "./determinism.js";

test("verifyHash throws on drift", () => {
  assert.throws(() => verifyHash("expected", "actual", "fixture"), /DETERMINISM FAIL/);
});
