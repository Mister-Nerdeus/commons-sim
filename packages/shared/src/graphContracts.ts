import { z } from "zod";

export const GraphLinkPatternSchema = z.enum([
  "direct connection",
  "bus",
  "allocator",
  "aggregator",
  "controller",
  "feedback loop",
]);

export const GraphNodeSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
  moduleId: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
  label: z.string().min(1),
});

export const GraphEdgeSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
  fromNodeId: z.string().min(1),
  fromTerminalId: z.string().min(1),
  toNodeId: z.string().min(1),
  toTerminalId: z.string().min(1),
  resourceType: z.string().min(1),
  linkPattern: GraphLinkPatternSchema,
});

function graphSchema(kind: "problem" | "solution" | "world") {
  return z
    .object({
      graphId: z.string().min(1),
      graphKind: z.literal(kind),
      version: z.string().regex(/^\d+\.\d+\.\d+$/),
      nodes: z.array(GraphNodeSchema).min(1),
      edges: z.array(GraphEdgeSchema).default([]),
    })
    .superRefine((graph, ctx) => {
      const nodeIds = new Set(graph.nodes.map((node) => node.id));
      for (const [index, edge] of graph.edges.entries()) {
        if (!nodeIds.has(edge.fromNodeId)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["edges", index, "fromNodeId"], message: "fromNodeId does not reference a graph node" });
        }
        if (!nodeIds.has(edge.toNodeId)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["edges", index, "toNodeId"], message: "toNodeId does not reference a graph node" });
        }
      }
    });
}

export const ProblemGraphSchema = graphSchema("problem");
export const SolutionGraphSchema = graphSchema("solution");
export const WorldGraphSchema = graphSchema("world");

export type GraphNode = z.infer<typeof GraphNodeSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;
export type ProblemGraph = z.infer<typeof ProblemGraphSchema>;
export type SolutionGraph = z.infer<typeof SolutionGraphSchema>;
export type WorldGraph = z.infer<typeof WorldGraphSchema>;
