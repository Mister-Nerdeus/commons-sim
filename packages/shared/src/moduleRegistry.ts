import { z } from "zod";
import { ProvenanceStateSchema, ValidationStatusSchema } from "./semanticPrimitives.js";
import { ModuleLifecycleStageSchema, ModuleRoleSchema, ModuleTaxonomyPathSchema } from "./moduleTaxonomy.js";

export const ModuleRegistryEntrySchema = z.object({
  moduleId: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  taxonomyPath: ModuleTaxonomyPathSchema,
  lifecycleStage: ModuleLifecycleStageSchema,
  roles: z.array(ModuleRoleSchema).min(1),
  metadata: z.object({
    name: z.string().min(1),
    summary: z.string().min(1),
    maintainers: z.array(z.string().min(1)).min(1),
  }),
  problemBriefRef: z.string().min(1),
  solutionBriefRef: z.string().min(1),
  terminalRefs: z.array(z.string().min(1)).min(1),
  dependencyRules: z.array(z.string().min(1)).min(1),
  provenance: ProvenanceStateSchema,
  validationStatus: ValidationStatusSchema,
});

export const ModuleRegistrySchema = z
  .object({
    registryId: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    modules: z.array(ModuleRegistryEntrySchema).min(1),
  })
  .superRefine((registry, ctx) => {
    const seen = new Set<string>();
    for (const [index, module] of registry.modules.entries()) {
      if (seen.has(module.moduleId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["modules", index, "moduleId"],
          message: `duplicate module id: ${module.moduleId}`,
        });
      }
      seen.add(module.moduleId);
    }
  });

export type ModuleRegistryEntry = z.infer<typeof ModuleRegistryEntrySchema>;
export type ModuleRegistry = z.infer<typeof ModuleRegistrySchema>;
