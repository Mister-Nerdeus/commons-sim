import { z } from "zod";
import { AiArtifactTagSchema, ProvenanceStateSchema, UncertaintyMetadataSchema, UnitIdSchema } from "./semanticPrimitives.js";

export const VariableValueTypeSchema = z.enum(["number", "integer", "boolean", "string", "enum"]);

export const VariableEditabilitySchema = z.enum(["editable", "derived", "locked", "operator_only"]);

const VariableRangeSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    allowedValues: z.array(z.union([z.string(), z.number(), z.boolean()])).min(1).optional(),
  })
  .superRefine((range, ctx) => {
    if (range.min !== undefined && range.max !== undefined && range.min > range.max) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "validRange.min must be <= validRange.max" });
    }
  });

const DefaultValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const VariableDefinitionSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/),
    name: z.string().min(1),
    domain: z.string().min(1),
    type: VariableValueTypeSchema,
    unit: UnitIdSchema,
    validRange: VariableRangeSchema,
    defaultValue: DefaultValueSchema,
    provenance: ProvenanceStateSchema,
    uncertainty: UncertaintyMetadataSchema,
    editability: VariableEditabilitySchema,
    dependencyNotes: z.array(z.string().min(1)).min(1),
    ai: AiArtifactTagSchema.optional(),
  })
  .superRefine((variable, ctx) => {
    const value = variable.defaultValue;
    if (variable.type === "number" && typeof value !== "number") addDefaultIssue(ctx, "number");
    if (variable.type === "integer" && (!Number.isInteger(value) || typeof value !== "number")) addDefaultIssue(ctx, "integer");
    if (variable.type === "boolean" && typeof value !== "boolean") addDefaultIssue(ctx, "boolean");
    if ((variable.type === "string" || variable.type === "enum") && typeof value !== "string") addDefaultIssue(ctx, "string");

    if (typeof value === "number") {
      if (variable.validRange.min !== undefined && value < variable.validRange.min) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["defaultValue"], message: "defaultValue is below validRange.min" });
      }
      if (variable.validRange.max !== undefined && value > variable.validRange.max) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["defaultValue"], message: "defaultValue is above validRange.max" });
      }
    }

    if (variable.validRange.allowedValues && !variable.validRange.allowedValues.includes(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["defaultValue"], message: "defaultValue is not in validRange.allowedValues" });
    }
  });

export const VariableRegistrySchema = z
  .object({
    registryId: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    variables: z.array(VariableDefinitionSchema).min(1),
  })
  .superRefine((registry, ctx) => {
    const seen = new Set<string>();
    for (const [index, variable] of registry.variables.entries()) {
      if (seen.has(variable.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variables", index, "id"],
          message: `duplicate variable id: ${variable.id}`,
        });
      }
      seen.add(variable.id);
    }
  });

function addDefaultIssue(ctx: z.RefinementCtx, expected: string) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ["defaultValue"],
    message: `defaultValue must match variable type ${expected}`,
  });
}

export type VariableValueType = z.infer<typeof VariableValueTypeSchema>;
export type VariableEditability = z.infer<typeof VariableEditabilitySchema>;
export type VariableDefinition = z.infer<typeof VariableDefinitionSchema>;
export type VariableRegistry = z.infer<typeof VariableRegistrySchema>;
