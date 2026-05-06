import { z } from "zod";
import { DesignDocumentSchema } from "./designDocument.js";
import { DesignModeSchema } from "./modePolicy.js";
import { ModeValidationIssueSchema } from "./modeValidation.js";

export const AiDesignProposalStatusSchema = z.enum(["draft", "accepted", "rejected", "remixed", "superseded"]);

export const AiDesignProposalSchema = z.object({
  proposalVersion: z.literal(1),
  proposalId: z.string().min(1),
  createdAtUtc: z.string().min(1),
  prompt: z.string().min(1),
  seed: z.number().int().optional(),
  designMode: DesignModeSchema,
  status: AiDesignProposalStatusSchema,
  stylePreset: z.string().min(1),
  generatedManifest: z.unknown().optional(),
  generatedDesignDocument: DesignDocumentSchema.optional(),
  warnings: z.array(ModeValidationIssueSchema),
  ai: z.object({
    origin: z.enum(["AI", "Human", "Mixed"]),
    scope: z.enum(["Draft", "Experimental", "Reviewed", "Approved"]),
    confidence: z.enum(["Low", "Medium", "High"]),
    validation_status: z.enum(["Failed", "Partial", "Passed"]),
  }),
  userDecision: z
    .object({
      decidedAtUtc: z.string().min(1),
      decision: z.enum(["accepted", "rejected", "remixed"]),
      notes: z.string(),
    })
    .optional(),
});
export type AiDesignProposal = z.infer<typeof AiDesignProposalSchema>;

export function proposalIsApprovedTruthPlane(proposal: AiDesignProposal) {
  return proposal.ai.scope === "Approved" && proposal.status === "accepted" && proposal.ai.validation_status === "Passed";
}
