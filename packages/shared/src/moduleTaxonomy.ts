import { z } from "zod";

export const ModuleRoleSchema = z.enum([
  "Source",
  "Sink",
  "Store",
  "Transform",
  "Route",
  "Control",
  "Sense",
  "Protect",
  "Coordinate",
  "Demand",
]);

export const ModuleLifecycleStageSchema = z.enum([
  "Class",
  "Generic Template",
  "Real-World Binding",
  "Scenario Instance",
]);

export const ModuleTaxonomyPathSchema = z.object({
  domain: z.string().min(1),
  category: z.string().min(1),
  family: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
});

export const ModuleIdentitySchema = z.object({
  moduleId: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  taxonomyPath: ModuleTaxonomyPathSchema,
  lifecycleStage: ModuleLifecycleStageSchema,
  roles: z.array(ModuleRoleSchema).min(1),
  summary: z.string().min(1),
});

export type ModuleRole = z.infer<typeof ModuleRoleSchema>;
export type ModuleLifecycleStage = z.infer<typeof ModuleLifecycleStageSchema>;
export type ModuleTaxonomyPath = z.infer<typeof ModuleTaxonomyPathSchema>;
export type ModuleIdentity = z.infer<typeof ModuleIdentitySchema>;
