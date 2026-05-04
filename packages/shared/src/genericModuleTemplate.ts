import { z } from "zod";
import { ProvenanceStateSchema, UnitIdSchema, ValidationStatusSchema } from "./semanticPrimitives.js";
import { ModuleTerminalSchema } from "./moduleTerminals.js";
import { ModuleLifecycleStageSchema, ModuleRoleSchema, ModuleTaxonomyPathSchema } from "./moduleTaxonomy.js";

const SlugIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
const VersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export const ModuleFootprintSchema = z
  .object({
    landArea: z.object({
      value: z.number().nonnegative(),
      unit: UnitIdSchema,
    }),
    indoorArea: z.object({
      value: z.number().nonnegative(),
      unit: UnitIdSchema,
    }),
    spatialNotes: z.string().min(1),
  })
  .strict();

export const ModuleCapacitySchema = z
  .object({
    nominal: z.number().nonnegative(),
    peak: z.number().nonnegative(),
    unit: UnitIdSchema,
    sizingBasis: z.string().min(1),
  })
  .strict()
  .superRefine((capacity, ctx) => {
    if (capacity.peak < capacity.nominal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["peak"],
        message: "peak capacity must be >= nominal capacity",
      });
    }
  });

export const ModuleDependencyRuleSchema = z
  .object({
    id: SlugIdSchema,
    description: z.string().min(1),
    required: z.boolean(),
    dependencyType: z.enum(["resource", "service", "control", "spatial", "labor", "information"]),
  })
  .strict();

export const ModuleBaselineCostSchema = z
  .object({
    capitalCost: z.object({
      value: z.number().nonnegative(),
      unit: z.literal("usd"),
    }),
    monthlyOperatingCost: z.object({
      value: z.number().nonnegative(),
      unit: z.literal("usd/month"),
    }),
    laborHoursPerMonth: z.object({
      value: z.number().nonnegative(),
      unit: z.literal("hours/month"),
    }),
    costBasis: z.string().min(1),
  })
  .strict();

export const ModuleFairnessProfileSchema = z
  .object({
    challengeRelevant: z.boolean(),
    fairnessNotes: z.string().min(1),
    tunableParameters: z.array(z.string().min(1)).default([]),
  })
  .strict();

export const GenericModuleTemplateSchema = z
  .object({
    templateId: SlugIdSchema,
    moduleId: SlugIdSchema,
    version: VersionSchema,
    lifecycleStage: ModuleLifecycleStageSchema,
    taxonomyPath: ModuleTaxonomyPathSchema,
    roles: z.array(ModuleRoleSchema).min(1),
    name: z.string().min(1),
    summary: z.string().min(1),
    problemBriefRef: z.string().min(1),
    solutionBriefRef: z.string().min(1),
    footprint: ModuleFootprintSchema,
    capacity: ModuleCapacitySchema,
    requiredInputs: z.array(ModuleTerminalSchema).default([]),
    outputs: z.array(ModuleTerminalSchema).min(1),
    dependencies: z.array(ModuleDependencyRuleSchema).default([]),
    baselineCosts: ModuleBaselineCostSchema,
    fairness: ModuleFairnessProfileSchema,
    provenance: ProvenanceStateSchema,
    validationStatus: ValidationStatusSchema,
  })
  .strict()
  .superRefine((template, ctx) => {
    if (template.lifecycleStage !== "Generic Template") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lifecycleStage"],
        message: "generic module templates must use lifecycleStage Generic Template",
      });
    }

    const terminalIds = new Set<string>();
    for (const [index, terminal] of template.requiredInputs.entries()) {
      if (terminal.direction === "output") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["requiredInputs", index, "direction"],
          message: "requiredInputs may not contain output-only terminals",
        });
      }
      if (terminalIds.has(terminal.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["requiredInputs", index, "id"],
          message: `duplicate terminal id: ${terminal.id}`,
        });
      }
      terminalIds.add(terminal.id);
    }

    for (const [index, terminal] of template.outputs.entries()) {
      if (terminal.direction === "input") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["outputs", index, "direction"],
          message: "outputs may not contain input-only terminals",
        });
      }
      if (terminalIds.has(terminal.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["outputs", index, "id"],
          message: `duplicate terminal id: ${terminal.id}`,
        });
      }
      terminalIds.add(terminal.id);
    }
  });

export type ModuleFootprint = z.infer<typeof ModuleFootprintSchema>;
export type ModuleCapacity = z.infer<typeof ModuleCapacitySchema>;
export type ModuleDependencyRule = z.infer<typeof ModuleDependencyRuleSchema>;
export type ModuleBaselineCost = z.infer<typeof ModuleBaselineCostSchema>;
export type ModuleFairnessProfile = z.infer<typeof ModuleFairnessProfileSchema>;
export type GenericModuleTemplate = z.infer<typeof GenericModuleTemplateSchema>;
