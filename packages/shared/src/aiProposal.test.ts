import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AiDesignProposalSchema, proposalIsApprovedTruthPlane } from "./aiProposal.js";

test("AI proposal fixtures validate", () => {
  for (const fixturePath of [
    "examples/ai/polygon-village.proposal.json",
    "examples/ai/rejected-dream-layout.proposal.json",
  ]) {
    const fixture = JSON.parse(readFileSync(rootFixturePath(fixturePath), "utf8"));
    assert.equal(AiDesignProposalSchema.safeParse(fixture).success, true, fixturePath);
  }
});

test("draft proposals are not treated as approved truth", () => {
  const fixture = AiDesignProposalSchema.parse(
    JSON.parse(readFileSync(rootFixturePath("examples/ai/polygon-village.proposal.json"), "utf8")),
  );
  assert.equal(proposalIsApprovedTruthPlane(fixture), false);
});

function rootFixturePath(path: string) {
  return resolve(process.cwd(), "../..", path);
}
