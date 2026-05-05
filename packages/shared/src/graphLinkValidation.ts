import { z } from "zod";
import type { GenericModuleTemplate } from "./genericModuleTemplate.js";
import type { GraphEdge, GraphNode } from "./graphContracts.js";
import type { ModuleTerminal, TerminalDirection } from "./moduleTerminals.js";
import type { ResourceCompatibilityRule, ResourceCompatibilityRuleSet } from "./resourceInterface.js";

type GraphLike = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export const GraphLinkValidationSeveritySchema = z.enum(["error", "warning", "info"]);

export const GraphLinkValidationIssueCodeSchema = z.enum([
  "MISSING_FROM_NODE",
  "MISSING_TO_NODE",
  "MISSING_FROM_TERMINAL",
  "MISSING_TO_TERMINAL",
  "INVALID_DIRECTION_PAIR",
  "INCOMPATIBLE_RESOURCE_TYPE",
  "INCOMPATIBLE_UNIT",
  "INCOMPATIBLE_TIMING",
  "ADAPTER_REQUIRED",
  "MISSING_COMPATIBILITY_RULE",
  "DUPLICATE_MODULE_TEMPLATE",
]);

export const GraphLinkValidationIssueSchema = z
  .object({
    code: GraphLinkValidationIssueCodeSchema,
    severity: GraphLinkValidationSeveritySchema,
    edgeId: z.string().min(1),
    message: z.string().min(1),
    details: z.record(z.unknown()).default({}),
  })
  .strict();

export const GraphLinkValidationResultSchema = z
  .object({
    ok: z.boolean(),
    issueCount: z.number().int().nonnegative(),
    issues: z.array(GraphLinkValidationIssueSchema),
  })
  .strict();

export type GraphLinkValidationSeverity = z.infer<typeof GraphLinkValidationSeveritySchema>;
export type GraphLinkValidationIssue = z.infer<typeof GraphLinkValidationIssueSchema>;
export type GraphLinkValidationResult = z.infer<typeof GraphLinkValidationResultSchema>;

export function validateGraphLinks(
  graph: GraphLike,
  templates: GenericModuleTemplate[],
  compatibilityRules: ResourceCompatibilityRuleSet | ResourceCompatibilityRule[],
): GraphLinkValidationResult {
  const issues: GraphLinkValidationIssue[] = [];
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const templatesByModuleId = new Map<string, GenericModuleTemplate>();
  const duplicateModuleIds = new Set<string>();
  for (const template of templates) {
    if (templatesByModuleId.has(template.moduleId)) {
      duplicateModuleIds.add(template.moduleId);
      continue;
    }
    templatesByModuleId.set(template.moduleId, template);
  }
  const rules = Array.isArray(compatibilityRules) ? compatibilityRules : compatibilityRules.rules;

  for (const edge of graph.edges) {
    const fromNode = nodesById.get(edge.fromNodeId);
    const toNode = nodesById.get(edge.toNodeId);

    if (!fromNode) {
      issues.push(issue("MISSING_FROM_NODE", "error", edge.id, "fromNodeId does not reference a graph node", {
        fromNodeId: edge.fromNodeId,
      }));
    }

    if (!toNode) {
      issues.push(issue("MISSING_TO_NODE", "error", edge.id, "toNodeId does not reference a graph node", {
        toNodeId: edge.toNodeId,
      }));
    }

    if (fromNode && duplicateModuleIds.has(fromNode.moduleId)) {
      issues.push(issue("DUPLICATE_MODULE_TEMPLATE", "error", edge.id, "fromNode moduleId resolves to multiple templates", {
        moduleId: fromNode.moduleId,
        fromNodeId: fromNode.id,
      }));
    }

    if (toNode && duplicateModuleIds.has(toNode.moduleId)) {
      issues.push(issue("DUPLICATE_MODULE_TEMPLATE", "error", edge.id, "toNode moduleId resolves to multiple templates", {
        moduleId: toNode.moduleId,
        toNodeId: toNode.id,
      }));
    }

    if ((fromNode && duplicateModuleIds.has(fromNode.moduleId)) || (toNode && duplicateModuleIds.has(toNode.moduleId))) {
      continue;
    }

    const fromTerminal = fromNode ? findTerminal(templatesByModuleId.get(fromNode.moduleId), edge.fromTerminalId) : undefined;
    const toTerminal = toNode ? findTerminal(templatesByModuleId.get(toNode.moduleId), edge.toTerminalId) : undefined;

    if (fromNode && !fromTerminal) {
      issues.push(issue("MISSING_FROM_TERMINAL", "error", edge.id, "fromTerminalId does not reference a module terminal", {
        fromNodeId: edge.fromNodeId,
        fromTerminalId: edge.fromTerminalId,
      }));
    }

    if (toNode && !toTerminal) {
      issues.push(issue("MISSING_TO_TERMINAL", "error", edge.id, "toTerminalId does not reference a module terminal", {
        toNodeId: edge.toNodeId,
        toTerminalId: edge.toTerminalId,
      }));
    }

    if (!fromTerminal || !toTerminal) {
      continue;
    }

    if (!isValidDirectionPair(fromTerminal.direction, toTerminal.direction)) {
      issues.push(issue("INVALID_DIRECTION_PAIR", "error", edge.id, "graph edge direction pair is not output-to-input compatible", {
        fromDirection: fromTerminal.direction,
        toDirection: toTerminal.direction,
      }));
    }

    const rule = findRule(rules, fromTerminal, toTerminal);
    if (rule) {
      issues.push(...issuesForRule(edge, fromTerminal, toTerminal, rule));
      continue;
    }

    issues.push(issue("MISSING_COMPATIBILITY_RULE", "error", edge.id, "no explicit compatibility rule matches this graph link", {
      fromResourceType: fromTerminal.resourceType,
      toResourceType: toTerminal.resourceType,
      fromUnit: fromTerminal.unit,
      toUnit: toTerminal.unit,
      fromTimingModel: fromTerminal.timingModel,
      toTimingModel: toTerminal.timingModel,
    }));

    if (fromTerminal.resourceType !== toTerminal.resourceType) {
      issues.push(issue("INCOMPATIBLE_RESOURCE_TYPE", "error", edge.id, "terminal resource types are not compatible and no rule allows them", {
        fromResourceType: fromTerminal.resourceType,
        toResourceType: toTerminal.resourceType,
        edgeResourceType: edge.resourceType,
      }));
    }

    if (fromTerminal.unit !== toTerminal.unit) {
      issues.push(issue("INCOMPATIBLE_UNIT", "error", edge.id, "terminal units are not compatible and no rule allows them", {
        fromUnit: fromTerminal.unit,
        toUnit: toTerminal.unit,
      }));
    }

    if (fromTerminal.timingModel !== toTerminal.timingModel) {
      issues.push(issue("INCOMPATIBLE_TIMING", "error", edge.id, "terminal timing models are not compatible and no rule allows them", {
        fromTimingModel: fromTerminal.timingModel,
        toTimingModel: toTerminal.timingModel,
      }));
    }
  }

  const errorCount = issues.filter((validationIssue) => validationIssue.severity === "error").length;
  return {
    ok: errorCount === 0,
    issueCount: issues.length,
    issues,
  };
}

function findTerminal(template: GenericModuleTemplate | undefined, terminalId: string): ModuleTerminal | undefined {
  return [...(template?.requiredInputs ?? []), ...(template?.outputs ?? [])].find((terminal) => terminal.id === terminalId);
}

function isValidDirectionPair(fromDirection: TerminalDirection, toDirection: TerminalDirection): boolean {
  return (fromDirection === "output" || fromDirection === "bidirectional") && (toDirection === "input" || toDirection === "bidirectional");
}

function findRule(
  rules: ResourceCompatibilityRule[],
  fromTerminal: ModuleTerminal,
  toTerminal: ModuleTerminal,
): ResourceCompatibilityRule | undefined {
  return rules.find(
    (rule) =>
      rule.fromResourceType === fromTerminal.resourceType &&
      rule.toResourceType === toTerminal.resourceType &&
      rule.fromUnit === fromTerminal.unit &&
      rule.toUnit === toTerminal.unit &&
      rule.fromTimingModel === fromTerminal.timingModel &&
      rule.toTimingModel === toTerminal.timingModel,
  );
}

function issuesForRule(
  edge: GraphEdge,
  fromTerminal: ModuleTerminal,
  toTerminal: ModuleTerminal,
  rule: ResourceCompatibilityRule,
): GraphLinkValidationIssue[] {
  if (rule.decision === "compatible") {
    return [];
  }

  if (rule.decision === "requires_adapter") {
    return [
      issue("ADAPTER_REQUIRED", "warning", edge.id, "compatibility rule requires an adapter for this graph link", {
        ruleId: rule.id,
        adapterNotes: rule.adapterNotes,
      }),
    ];
  }

  const details = {
    ruleId: rule.id,
    fromResourceType: fromTerminal.resourceType,
    toResourceType: toTerminal.resourceType,
    fromUnit: fromTerminal.unit,
    toUnit: toTerminal.unit,
    fromTimingModel: fromTerminal.timingModel,
    toTimingModel: toTerminal.timingModel,
  };

  if (fromTerminal.resourceType !== toTerminal.resourceType) {
    return [issue("INCOMPATIBLE_RESOURCE_TYPE", "error", edge.id, rule.rationale, details)];
  }

  if (fromTerminal.unit !== toTerminal.unit) {
    return [issue("INCOMPATIBLE_UNIT", "error", edge.id, rule.rationale, details)];
  }

  if (fromTerminal.timingModel !== toTerminal.timingModel) {
    return [issue("INCOMPATIBLE_TIMING", "error", edge.id, rule.rationale, details)];
  }

  return [issue("INCOMPATIBLE_RESOURCE_TYPE", "error", edge.id, rule.rationale, details)];
}

function issue(
  code: z.infer<typeof GraphLinkValidationIssueCodeSchema>,
  severity: GraphLinkValidationSeverity,
  edgeId: string,
  message: string,
  details: Record<string, unknown>,
): GraphLinkValidationIssue {
  return { code, severity, edgeId, message, details };
}
