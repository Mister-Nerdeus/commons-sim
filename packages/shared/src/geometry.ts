import { z } from "zod";

export const PointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});
export type Point = z.infer<typeof PointSchema>;

export const PolygonGeometrySchema = z.object({
  type: z.literal("polygon"),
  points: z.array(PointSchema).min(3),
});

export const RegularPolygonGeometrySchema = z.object({
  type: z.literal("regular-polygon"),
  center: PointSchema,
  radius: z.number().positive(),
  sideCount: z.number().int().min(3).max(128),
  rotationDegrees: z.number().finite().default(0),
});

export const RectangleGeometrySchema = z.object({
  type: z.literal("rectangle"),
  origin: PointSchema,
  width: z.number().positive(),
  height: z.number().positive(),
  rotationDegrees: z.number().finite().default(0),
});

export const PathGeometrySchema = z.object({
  type: z.literal("path"),
  points: z.array(PointSchema).min(2),
  width: z.number().positive().optional(),
});

export const RingGeometrySchema = z.object({
  type: z.literal("ring"),
  center: PointSchema,
  innerRadius: z.number().nonnegative(),
  outerRadius: z.number().positive(),
  sideCount: z.number().int().min(3).max(128).optional(),
}).refine((ring) => ring.outerRadius > ring.innerRadius, {
  message: "outerRadius must be greater than innerRadius",
  path: ["outerRadius"],
});

export const RadialSegmentGeometrySchema = z.object({
  type: z.literal("radial-segment"),
  center: PointSchema,
  innerRadius: z.number().nonnegative(),
  outerRadius: z.number().positive(),
  startDegrees: z.number().finite(),
  endDegrees: z.number().finite(),
}).refine((segment) => segment.outerRadius > segment.innerRadius, {
  message: "outerRadius must be greater than innerRadius",
  path: ["outerRadius"],
});

export const GeometrySchema = z
  .union([
    PolygonGeometrySchema,
    RegularPolygonGeometrySchema,
    RectangleGeometrySchema,
    PathGeometrySchema,
    RingGeometrySchema,
    RadialSegmentGeometrySchema,
  ])
  .superRefine((geometry: any, ctx) => {
    if (geometry.type !== "polygon") return;
    const unique = new Set(geometry.points.map((point: Point) => `${point.x}:${point.y}`));
    if (unique.size < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "polygon must contain at least three distinct points",
        path: ["points"],
      });
    }
  });
export type Geometry = z.infer<typeof GeometrySchema>;
