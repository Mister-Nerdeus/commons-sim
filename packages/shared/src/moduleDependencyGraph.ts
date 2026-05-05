import { z } from "zod";
import { ValidationStatusSchema } from "./semanticPrimitives.js";

const SlugIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
const VersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export const DependencyCategorySchema = z.enum([
  "resource",
  "service",
  "control",
  "spatial",
  "labor",
  "information",
]);

export const DependencyRequirednessSchema = z.enum(["required", "optional"]);
export const DependencyStateSchema = z.enum(["satisfied", "unresolved", "external"]);

export const ModuleDependencyNodeSchema = z
  .object({
    id: SlugIdSchema,
    moduleId: SlugIdSchema,
    templateId: SlugIdSchema,
    dependencyType: DependencyCategorySchema,
    requiredness: DependencyRequirednessSchema,
    state: DependencyStateSchema,
    description: z.string().min(1),
    sourceRef: z.string(),
  })
  .strict()
  .superRefine((node, ctx) => {
    if (node.requiredness === "required" && node.state === "unresolved") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["state"],
        message: "required dependency nodes may not remain unresolved",
      });
    }

    if (node.state === "external" && node.sourceRef.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceRef"],
        message: "external dependency nodes require a sourceRef",
      });
    }
  });

export const ModuleDependencyEdgeSchema = z
  .object({
    id: SlugIdSchema,
    fromNodeId: SlugIdSchema,
    toNodeId: SlugIdSchema,
    dependencyType: DependencyCategorySchema,
    required: z.boolean(),
    rationale: z.string().min(1),
  })
  .strict();

export const ModuleDependencyGraphSchema = z
  .object({
    graphId: SlugIdSchema,
    version: VersionSchema,
    nodes: z.array(ModuleDependencyNodeSchema).min(1),
    edges: z.array(ModuleDependencyEdgeSchema).default([]),
    validationStatus: ValidationStatusSchema,
  })
  .strict()
  .superRefine((graph, ctx) => {
    const nodeIds = new Set<string>();
    for (const [index, node] of graph.nodes.entries()) {
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nodes", index, "id"],
          message: `duplicate dependency node id: ${node.id}`,
        });
      }
      nodeIds.add(node.id);
    }

    const edgeIds = new Set<string>();
    for (const [index, edge] of graph.edges.entries()) {
      if (edgeIds.has(edge.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", index, "id"],
          message: `duplicate dependency edge id: ${edge.id}`,
        });
      }
      edgeIds.add(edge.id);

      if (!nodeIds.has(edge.fromNodeId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", index, "fromNodeId"],
          message: "fromNodeId does not reference a dependency node",
        });
      }

      if (!nodeIds.has(edge.toNodeId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", index, "toNodeId"],
          message: "toNodeId does not reference a dependency node",
        });
      }

      const toNode = graph.nodes.find((node) => node.id === edge.toNodeId);
      if (edge.required && toNode?.state === "unresolved") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["edges", index, "toNodeId"],
          message: "required dependency edge may not target an unresolved dependency node",
        });
      }
    }
  });

export type DependencyCategory = z.infer<typeof DependencyCategorySchema>;
export type DependencyRequiredness = z.infer<typeof DependencyRequirednessSchema>;
export type DependencyState = z.infer<typeof DependencyStateSchema>;
export type ModuleDependencyNode = z.infer<typeof ModuleDependencyNodeSchema>;
export type ModuleDependencyEdge = z.infer<typeof ModuleDependencyEdgeSchema>;
export type ModuleDependencyGraph = z.infer<typeof ModuleDependencyGraphSchema>;
