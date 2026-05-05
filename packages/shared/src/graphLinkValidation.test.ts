import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GenericModuleTemplateSchema, type GenericModuleTemplate } from "./genericModuleTemplate.js";
import { SolutionGraphSchema, type SolutionGraph } from "./graphContracts.js";
import { validateGraphLinks } from "./graphLinkValidation.js";
import { ResourceCompatibilityRuleSetSchema } from "./resourceInterface.js";

const root = repoRoot();

test("valid graph link fixture passes static validation", () => {
  const result = validateGraphLinks(
    loadGraph("examples/graphs/link-validation.valid.json"),
    loadTemplates(),
    loadRules(),
  );

  assert.equal(result.ok, true);
  assert.equal(result.issueCount, 0);
});

test("direction mismatch fixture fails static validation", () => {
  const result = validateGraphLinks(
    loadGraph("examples/graphs/link-validation.invalid-direction.json"),
    loadTemplates(),
    loadRules(),
  );

  assert.equal(result.ok, false);
  assert.equal(result.issues.some((issue) => issue.code === "INVALID_DIRECTION_PAIR"), true);
});

test("resource mismatch fixture fails static validation", () => {
  const result = validateGraphLinks(
    loadGraph("examples/graphs/link-validation.invalid-resource.json"),
    loadTemplates(),
    loadRules(),
  );

  assert.equal(result.ok, false);
  assert.equal(result.issues.some((issue) => issue.code === "INCOMPATIBLE_RESOURCE_TYPE"), true);
});

test("unit mismatches are reported as structured errors", () => {
  const templates = loadTemplates();
  const laundryTemplate = templates.find((template) => template.moduleId === "laundry");
  assert.ok(laundryTemplate);
  laundryTemplate.requiredInputs = laundryTemplate.requiredInputs.map((terminal) =>
    terminal.id === "laundry.loads_in" ? { ...terminal, unit: "loads/month" } : terminal,
  );

  const result = validateGraphLinks(
    loadGraph("examples/graphs/link-validation.valid.json"),
    templates,
    loadRules(),
  );

  assert.equal(result.ok, false);
  assert.equal(result.issues.some((issue) => issue.code === "INCOMPATIBLE_UNIT"), true);
});

test("timing mismatches are reported as structured errors", () => {
  const templates = loadTemplates();
  const laundryTemplate = templates.find((template) => template.moduleId === "laundry");
  assert.ok(laundryTemplate);
  laundryTemplate.requiredInputs = laundryTemplate.requiredInputs.map((terminal) =>
    terminal.id === "laundry.loads_in" ? { ...terminal, timingModel: "monthly" } : terminal,
  );

  const result = validateGraphLinks(
    loadGraph("examples/graphs/link-validation.valid.json"),
    templates,
    loadRules(),
  );

  assert.equal(result.ok, false);
  assert.equal(result.issues.some((issue) => issue.code === "INCOMPATIBLE_TIMING"), true);
});

test("adapter-required fixture returns warning and remains ok", () => {
  const result = validateGraphLinks(
    loadGraph("examples/graphs/link-validation.requires-adapter.json"),
    loadTemplates(),
    loadRules(),
  );

  assert.equal(result.ok, true);
  assert.equal(result.issueCount, 1);
  assert.equal(result.issues[0]?.code, "ADAPTER_REQUIRED");
  assert.equal(result.issues[0]?.severity, "warning");
});

test("missing compatibility rule fails closed", () => {
  const result = validateGraphLinks(
    loadGraph("examples/graphs/link-validation.valid.json"),
    loadTemplates(),
    { ...loadRules(), rules: [] },
  );

  assert.equal(result.ok, false);
  assert.equal(result.issues.some((issue) => issue.code === "MISSING_COMPATIBILITY_RULE"), true);
});

test("missing graph nodes and terminals are reported as structured errors", () => {
  const graph = loadGraph("examples/graphs/link-validation.valid.json");
  graph.edges = [
    {
      ...graph.edges[0],
      id: "missing-node-and-terminal",
      fromNodeId: "missing-source",
      toTerminalId: "missing.terminal",
    },
  ];

  const result = validateGraphLinks(graph, loadTemplates(), loadRules());

  assert.equal(result.ok, false);
  assert.equal(result.issues.some((issue) => issue.code === "MISSING_FROM_NODE"), true);
  assert.equal(result.issues.some((issue) => issue.code === "MISSING_TO_TERMINAL"), true);
});

function loadTemplates(): GenericModuleTemplate[] {
  return [
    parseTemplate("examples/modules/generic/community-meals.template.json"),
    parseTemplate("examples/modules/generic/laundry.template.json"),
  ];
}

function parseTemplate(relativePath: string): GenericModuleTemplate {
  return GenericModuleTemplateSchema.parse(loadJson(relativePath));
}

function loadGraph(relativePath: string): SolutionGraph {
  return SolutionGraphSchema.parse(loadJson(relativePath));
}

function loadRules() {
  return ResourceCompatibilityRuleSetSchema.parse(loadJson("examples/interfaces/compatibility-rules.valid.json"));
}

function loadJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf-8"));
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
