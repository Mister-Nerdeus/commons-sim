import { z } from "zod";

const NonEmptyStringArraySchema = z.array(z.string().min(1)).min(1);

export const ModuleProblemBriefSchema = z.object({
  problemStatement: z.string().min(1),
  stakeholders: NonEmptyStringArraySchema,
  targetScope: z.string().min(1),
  objectives: NonEmptyStringArraySchema,
  constraints: NonEmptyStringArraySchema,
  stressors: NonEmptyStringArraySchema,
  failureConsequences: NonEmptyStringArraySchema,
  successMetrics: NonEmptyStringArraySchema,
});

export const ModuleSolutionBriefSchema = z.object({
  architectureSummary: z.string().min(1),
  requiredInputs: NonEmptyStringArraySchema,
  outputs: NonEmptyStringArraySchema,
  dependencies: NonEmptyStringArraySchema,
  controlStrategy: z.string().min(1),
  technologyMaturity: z.enum(["concept", "prototype", "field-tested", "standard", "deprecated"]),
  footprint: z.string().min(1),
  staffingAssumptions: z.string().min(1),
  costAssumptions: z.string().min(1),
});

export type ModuleProblemBrief = z.infer<typeof ModuleProblemBriefSchema>;
export type ModuleSolutionBrief = z.infer<typeof ModuleSolutionBriefSchema>;
