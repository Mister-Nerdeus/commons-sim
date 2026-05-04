import { z } from "zod";
import {
  ProvenanceStateSchema,
  UnitFamilySchema,
  UnitIdSchema,
  ValidationStatusSchema,
} from "./semanticPrimitives.js";
import {
  TerminalAllocationModeSchema,
  TerminalCriticalitySchema,
  TerminalDirectionSchema,
} from "./moduleTerminals.js";

const SlugIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
const VersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export const ResourceTimingModelSchema = z.enum(["instant", "hourly", "daily", "monthly", "event"]);

export const CapacityRelationSchema = z.enum([
  "not_checked",
  "source_nominal_gte_target_nominal",
  "source_peak_gte_target_peak",
  "source_peak_gte_target_nominal",
]);

export const CriticalityRelationSchema = z.enum([
  "not_checked",
  "source_gte_target",
  "target_may_exceed_source",
  "must_match",
]);

export const ResourceInterfaceSchema = z
  .object({
    id: SlugIdSchema,
    resourceType: z.string().min(1),
    unit: UnitIdSchema,
    unitFamily: UnitFamilySchema,
    timingModels: z.array(ResourceTimingModelSchema).min(1),
    qualityAttributes: z.array(z.string().min(1)).default([]),
    allowedDirections: z.array(TerminalDirectionSchema).min(1),
    notes: z.string().min(1),
    provenance: ProvenanceStateSchema,
    validationStatus: ValidationStatusSchema,
  })
  .strict()
  .superRefine((resourceInterface, ctx) => {
    if (new Set(resourceInterface.timingModels).size !== resourceInterface.timingModels.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["timingModels"],
        message: "timingModels must not contain duplicates",
      });
    }

    if (new Set(resourceInterface.allowedDirections).size !== resourceInterface.allowedDirections.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowedDirections"],
        message: "allowedDirections must not contain duplicates",
      });
    }
  });

export const ResourceInterfaceRegistrySchema = z
  .object({
    registryId: SlugIdSchema,
    version: VersionSchema,
    interfaces: z.array(ResourceInterfaceSchema).min(1),
    validationStatus: ValidationStatusSchema,
  })
  .strict()
  .superRefine((registry, ctx) => {
    const ids = new Set<string>();
    for (const [index, resourceInterface] of registry.interfaces.entries()) {
      if (ids.has(resourceInterface.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["interfaces", index, "id"],
          message: `duplicate resource interface id: ${resourceInterface.id}`,
        });
      }
      ids.add(resourceInterface.id);
    }
  });

export const CompatibilityDecisionSchema = z.enum(["compatible", "incompatible", "requires_adapter"]);

export const ResourceCompatibilityRuleSchema = z
  .object({
    id: SlugIdSchema,
    fromResourceType: z.string().min(1),
    toResourceType: z.string().min(1),
    fromUnit: UnitIdSchema,
    toUnit: UnitIdSchema,
    fromUnitFamily: UnitFamilySchema,
    toUnitFamily: UnitFamilySchema,
    fromDirection: TerminalDirectionSchema,
    toDirection: TerminalDirectionSchema,
    fromTimingModel: ResourceTimingModelSchema,
    toTimingModel: ResourceTimingModelSchema,
    capacityRelation: CapacityRelationSchema,
    allocationModeCompatibility: z
      .object({
        from: TerminalAllocationModeSchema,
        to: TerminalAllocationModeSchema,
      })
      .strict(),
    criticalityRelation: CriticalityRelationSchema,
    decision: CompatibilityDecisionSchema,
    rationale: z.string().min(1),
    requiresAdapter: z.boolean(),
    adapterNotes: z.string().min(1),
    qualityRequirements: z.array(z.string().min(1)).default([]),
  })
  .strict()
  .superRefine((rule, ctx) => {
    if (rule.decision === "requires_adapter" && !rule.requiresAdapter) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requiresAdapter"],
        message: "requiresAdapter must be true when decision is requires_adapter",
      });
    }

    if (rule.decision !== "requires_adapter" && rule.requiresAdapter) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requiresAdapter"],
        message: "requiresAdapter may only be true for requires_adapter decisions",
      });
    }

    if (rule.fromDirection === "input" && rule.toDirection === "input") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fromDirection"],
        message: "compatibility rules may not connect input-only terminals to input-only terminals",
      });
    }

    if (rule.fromDirection === "output" && rule.toDirection === "output") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toDirection"],
        message: "compatibility rules may not connect output-only terminals to output-only terminals",
      });
    }
  });

export const ResourceCompatibilityRuleSetSchema = z
  .object({
    ruleSetId: SlugIdSchema,
    version: VersionSchema,
    rules: z.array(ResourceCompatibilityRuleSchema).min(1),
    validationStatus: ValidationStatusSchema,
  })
  .strict()
  .superRefine((ruleSet, ctx) => {
    const ids = new Set<string>();
    for (const [index, rule] of ruleSet.rules.entries()) {
      if (ids.has(rule.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rules", index, "id"],
          message: `duplicate compatibility rule id: ${rule.id}`,
        });
      }
      ids.add(rule.id);
    }
  });

export type ResourceTimingModel = z.infer<typeof ResourceTimingModelSchema>;
export type ResourceInterface = z.infer<typeof ResourceInterfaceSchema>;
export type ResourceInterfaceRegistry = z.infer<typeof ResourceInterfaceRegistrySchema>;
export type CompatibilityDecision = z.infer<typeof CompatibilityDecisionSchema>;
export type ResourceCompatibilityRule = z.infer<typeof ResourceCompatibilityRuleSchema>;
export type ResourceCompatibilityRuleSet = z.infer<typeof ResourceCompatibilityRuleSetSchema>;
