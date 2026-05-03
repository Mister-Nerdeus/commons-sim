import { z } from "zod";

export const UnitFamilySchema = z.enum([
  "count",
  "ratio",
  "currency",
  "mass",
  "volume",
  "energy",
  "power",
  "time",
  "area",
  "length",
  "temperature",
  "labor",
  "information",
  "quality",
]);

export const UnitIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*(?:\/[a-z][a-z0-9]*(?:_[a-z0-9]+)*)?$/, {
    message: "unit id must be lowercase snake_case, optionally as numerator/denominator",
  });

export const ProvenanceStateSchema = z.object({
  sourceType: z.enum(["assumption", "measured", "estimated", "calibrated", "derived", "source_backed"]),
  sourceRef: z.string().min(1),
  collectedAtUtc: z.string().datetime().optional(),
  method: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

export const UncertaintyMetadataSchema = z.object({
  kind: z.enum(["none", "bounded", "normal", "triangular", "qualitative"]),
  lower: z.number().optional(),
  upper: z.number().optional(),
  confidenceInterval: z.number().min(0).max(1).optional(),
  rationale: z.string().min(1),
});

export const ValidationStatusSchema = z.enum([
  "draft",
  "schema_valid",
  "locally_validated",
  "reviewed",
  "deprecated",
]);

export const ArtifactOriginSchema = z.enum(["human-authored", "ai-generated", "ai-assisted", "imported"]);

export const ArtifactScopeSchema = z.enum([
  "semantic-primitive",
  "variable",
  "module",
  "terminal",
  "graph",
  "registry",
  "documentation",
  "audit",
]);

export const ConfidenceSchema = z.number().min(0).max(1);

export const AiArtifactTagSchema = z.object({
  origin: ArtifactOriginSchema,
  scope: ArtifactScopeSchema,
  confidence: ConfidenceSchema,
  validation_status: ValidationStatusSchema,
  model: z.string().min(1).optional(),
  reviewedBy: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

export type UnitFamily = z.infer<typeof UnitFamilySchema>;
export type UnitId = z.infer<typeof UnitIdSchema>;
export type ProvenanceState = z.infer<typeof ProvenanceStateSchema>;
export type UncertaintyMetadata = z.infer<typeof UncertaintyMetadataSchema>;
export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;
export type AiArtifactTag = z.infer<typeof AiArtifactTagSchema>;
