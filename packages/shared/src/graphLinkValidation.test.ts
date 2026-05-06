import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GenericModuleTemplateSchema, type GenericModuleTemplate } from "./genericModuleTemplate.js";
import { SolutionGraphSchema, type SolutionGraph } from "./graphContracts.js";
import { validateGraphLinks, type GraphLinkValidationIssue } from "./graphLinkValidation.js";
import { ResourceCompatibilityRuleSetSchema, type ResourceCompatibilityRule } from "./resourceInterface.js";

const root = repoRoot();

test("valid graph link fixture passes static validation", () => {
  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.valid.json"), loadTemplates(), loadRules());

  assert.equal(result.ok, true);
  assert.equal(result.issueCount, 0);
});

test("input-to-input fixture fails static validation", () => {
  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.invalid-direction-input-input.json"), loadTemplates(), loadRules());

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "INVALID_DIRECTION_PAIR");
});

test("output-to-output fixture fails static validation", () => {
  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.invalid-direction-output-output.json"), loadTemplates(), loadRules());

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "INVALID_DIRECTION_PAIR");
});

test("input-to-output fixture fails static validation", () => {
  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.invalid-direction-input-output.json"), loadTemplates(), loadRules());

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "INVALID_DIRECTION_PAIR");
});

test("resource mismatch fixture fails static validation", () => {
  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.invalid-resource.json"), loadTemplates(), loadRules());

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "INCOMPATIBLE_RESOURCE_TYPE");
});

test("edge resourceType must match the source terminal resource type", () => {
  const graph = loadGraph("examples/graphs/link-validation.valid.json");
  graph.edges = [{ ...graph.edges[0], id: "bad-edge-resource", resourceType: "water" }];

  const result = validateGraphLinks(graph, loadTemplates(), loadRules());

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "INCOMPATIBLE_RESOURCE_TYPE");
});

test("unit mismatches are reported as structured errors", () => {
  const templates = loadTemplates();
  const laundryTemplate = templates.find((template) => template.moduleId === "laundry");
  assert.ok(laundryTemplate);
  laundryTemplate.requiredInputs = laundryTemplate.requiredInputs.map((terminal) =>
    terminal.id === "laundry.loads_in" ? { ...terminal, unit: "loads/month" } : terminal,
  );

  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.incompatible-unit.json"), templates, loadRules());

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "INCOMPATIBLE_UNIT");
});

test("timing mismatches are reported as structured errors", () => {
  const templates = loadTemplates();
  const laundryTemplate = templates.find((template) => template.moduleId === "laundry");
  assert.ok(laundryTemplate);
  laundryTemplate.requiredInputs = laundryTemplate.requiredInputs.map((terminal) =>
    terminal.id === "laundry.loads_in" ? { ...terminal, timingModel: "monthly" } : terminal,
  );

  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.valid.json"), templates, loadRules());

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "INCOMPATIBLE_TIMING");
});

test("adapter-required fixture returns warning and remains ok", () => {
  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.requires-adapter.json"), loadTemplates(), loadRules());

  assert.equal(result.ok, true);
  assert.equal(result.issueCount, 1);
  assert.equal(result.issues[0]?.code, "ADAPTER_REQUIRED");
  assert.equal(result.issues[0]?.severity, "warning");
});

test("missing compatibility rule fails closed", () => {
  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.missing-rule.json"), loadTemplates(), loadRules());

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "MISSING_COMPATIBILITY_RULE");
});

test("rule matching includes direction, allocation, capacity, and criticality dimensions", () => {
  const ruleSet = loadRules();
  const compatibleRule = ruleSet.rules.find((rule) => rule.id === "laundry-loads-daily-direct");
  assert.ok(compatibleRule);

  const wrongDirectionRule: ResourceCompatibilityRule = {
    ...compatibleRule,
    id: "laundry-loads-bidirectional-wrong",
    fromDirection: "bidirectional",
    decision: "incompatible",
    rationale: "Wrong direction rule must not match an output terminal.",
    requiresAdapter: false,
    adapterNotes: "",
  };
  const wrongAllocationRule: ResourceCompatibilityRule = {
    ...compatibleRule,
    id: "laundry-loads-allocation-wrong",
    allocationModeCompatibility: { from: "fixed", to: "priority" },
    decision: "incompatible",
    rationale: "Wrong allocation rule must not match a proportional output terminal.",
    requiresAdapter: false,
    adapterNotes: "",
  };
  const wrongCapacityRule: ResourceCompatibilityRule = {
    ...compatibleRule,
    id: "laundry-loads-capacity-wrong",
    capacityRelation: "source_nominal_gte_target_nominal",
    decision: "incompatible",
    rationale: "Wrong capacity relation must not match when source nominal is below target nominal.",
    requiresAdapter: false,
    adapterNotes: "",
  };
  const wrongCriticalityRule: ResourceCompatibilityRule = {
    ...compatibleRule,
    id: "laundry-loads-criticality-wrong",
    criticalityRelation: "source_gte_target",
    decision: "incompatible",
    rationale: "Wrong criticality relation must not match when source criticality is below target criticality.",
    requiresAdapter: false,
    adapterNotes: "",
  };
  const templates = loadTemplates();
  const laundryTemplate = templates.find((template) => template.moduleId === "laundry");
  assert.ok(laundryTemplate);
  laundryTemplate.requiredInputs = laundryTemplate.requiredInputs.map((terminal) =>
    terminal.id === "laundry.loads_in" ? { ...terminal, nominalCapacity: 50, criticality: "high" } : terminal,
  );

  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.valid.json"), templates, [
    wrongDirectionRule,
    wrongAllocationRule,
    wrongCapacityRule,
    wrongCriticalityRule,
    compatibleRule,
  ]);

  assert.equal(result.ok, true);
  assert.equal(result.issueCount, 0);
});

test("missing terminal fixture fails static validation", () => {
  const result = validateGraphLinks(loadGraph("examples/graphs/link-validation.missing-terminal.json"), loadTemplates(), loadRules());

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "MISSING_TO_TERMINAL");
});

test("duplicate module template fixture fails static validation", () => {
  const templates = loadTemplates();
  const laundryTemplate = templates.find((template) => template.moduleId === "laundry");
  assert.ok(laundryTemplate);

  const result = validateGraphLinks(
    loadGraph("examples/graphs/link-validation.duplicate-template.json"),
    [...templates, { ...laundryTemplate, templateId: "laundry-generic-copy" }],
    loadRules(),
  );

  assert.equal(result.ok, false);
  assertHasIssue(result.issues, "DUPLICATE_MODULE_TEMPLATE");
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
  assertHasIssue(result.issues, "MISSING_FROM_NODE");
  assertHasIssue(result.issues, "MISSING_TO_TERMINAL");
});

function loadTemplates(): GenericModuleTemplate[] {
  return [parseTemplate("examples/modules/generic/community-meals.template.json"), parseTemplate("examples/modules/generic/laundry.template.json")];
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

function assertHasIssue(issues: GraphLinkValidationIssue[], code: GraphLinkValidationIssue["code"]): void {
  assert.equal(
    issues.some((issue) => issue.code === code),
    true,
  );
}

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}
