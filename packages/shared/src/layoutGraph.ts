import { z } from "zod";
import { DesignModeSchema } from "./modePolicy.js";
import { GeometrySchema } from "./geometry.js";

export const LayoutNodeKindSchema = z.enum([
  "zone",
  "lot",
  "building-footprint",
  "path",
  "service-road",
  "utility-corridor",
  "green-space",
  "water-feature",
  "community-hub",
  "annotation",
]);

export const LayoutNodeSchema = z.object({
  id: z.string().min(1),
  kind: LayoutNodeKindSchema,
  geometry: GeometrySchema,
  label: z.string().min(1),
  moduleInstanceRef: z.string().min(1).optional(),
});
export type LayoutNode = z.infer<typeof LayoutNodeSchema>;

export const LayoutEdgeSchema = z.object({
  id: z.string().min(1),
  fromNodeId: z.string().min(1),
  toNodeId: z.string().min(1),
  kind: z.enum(["contains", "connects", "adjacent-to", "serves", "annotates"]),
  label: z.string().default(""),
});
export type LayoutEdge = z.infer<typeof LayoutEdgeSchema>;

export const LayoutGraphSchema = z
  .object({
    layoutVersion: z.literal(1),
    layoutId: z.string().min(1),
    title: z.string().min(1),
    units: z.enum(["ft", "m"]),
    coordinateSystem: z.literal("local-cartesian"),
    designMode: DesignModeSchema,
    scale: z.object({
      value: z.number().positive(),
      unit: z.enum(["ft", "m"]),
    }),
    nodes: z.array(LayoutNodeSchema),
    edges: z.array(LayoutEdgeSchema),
    metadata: z.object({
      seed: z.number().int().optional(),
      generatorId: z.string().min(1).optional(),
      notes: z.string(),
      tags: z.array(z.string()),
    }),
  })
  .superRefine((layout, ctx) => {
    const nodeIds = new Set(layout.nodes.map((node) => node.id));
    for (const edge of layout.edges) {
      if (!nodeIds.has(edge.fromNodeId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "edge fromNodeId must reference a node", path: ["edges"] });
      }
      if (!nodeIds.has(edge.toNodeId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "edge toNodeId must reference a node", path: ["edges"] });
      }
    }
  });
export type LayoutGraph = z.infer<typeof LayoutGraphSchema>;
