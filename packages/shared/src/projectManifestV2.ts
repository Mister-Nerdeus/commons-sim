import { z } from "zod";
import { AiDesignProposalSchema } from "./aiProposal.js";
import { DesignDocumentSchema } from "./designDocument.js";
import { DesignModeSchema } from "./modePolicy.js";
import { ModeValidationResultSchema } from "./modeValidation.js";
import { ScenarioSchema } from "./scenarioSchema.js";

export const ProjectManifestV2Schema = z.object({
  manifestVersion: z.literal(2),
  projectId: z.string().min(1),
  projectTitle: z.string().min(1),
  createdAtUtc: z.string().min(1),
  updatedAtUtc: z.string().min(1),
  sourceBranch: z.enum(["develop", "staging", "main"]),
  designMode: DesignModeSchema,
  designDocument: DesignDocumentSchema,
  compiledScenario: ScenarioSchema.optional(),
  validationResults: z.array(ModeValidationResultSchema),
  aiProposals: z.array(AiDesignProposalSchema),
  metadata: z.object({
    notes: z.string(),
    engineVersion: z.string().optional(),
    modelVersion: z.string().optional(),
    author: z.string().optional(),
  }),
});
export type ProjectManifestV2 = z.infer<typeof ProjectManifestV2Schema>;
