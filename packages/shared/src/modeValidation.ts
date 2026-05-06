import { z } from "zod";
import { DesignModeSchema, ModePolicySchema, ValidationSeveritySchema, type ModePolicy } from "./modePolicy.js";

export const ModeValidationIssueSchema = z.object({
  code: z.string().min(1),
  severity: ValidationSeveritySchema,
  path: z.string(),
  message: z.string().min(1),
  mode: DesignModeSchema,
  canUserOverride: z.boolean(),
});
export type ModeValidationIssue = z.infer<typeof ModeValidationIssueSchema>;

export const ModeValidationResultSchema = z.object({
  ok: z.boolean(),
  mode: DesignModeSchema,
  canSave: z.boolean(),
  canSimulate: z.boolean(),
  canSubmitToLeaderboard: z.boolean(),
  canExportProfessionalReport: z.boolean(),
  issueCount: z.number().int().nonnegative(),
  issues: z.array(ModeValidationIssueSchema),
});
export type ModeValidationResult = z.infer<typeof ModeValidationResultSchema>;

export function evaluateModeValidation(policy: ModePolicy, issues: ModeValidationIssue[]): ModeValidationResult {
  const parsedPolicy = ModePolicySchema.parse(policy);
  const parsedIssues = issues.map((issue) => ModeValidationIssueSchema.parse(issue));
  const hasBlocking = parsedIssues.some((issue) => issue.severity === "blocking");
  const hasError = parsedIssues.some((issue) => issue.severity === "error");
  const hasWarning = parsedIssues.some((issue) => issue.severity === "warning");
  const hardFailure = hasBlocking || hasError;

  const canSave = !hardFailure && (!hasWarning || parsedPolicy.canSaveWithWarnings);
  const canSimulate = !hardFailure && (!hasWarning || parsedPolicy.canSimulateWithWarnings);

  return ModeValidationResultSchema.parse({
    ok: !hardFailure,
    mode: parsedPolicy.mode,
    canSave,
    canSimulate,
    canSubmitToLeaderboard: parsedPolicy.canSubmitToLeaderboard && !hardFailure,
    canExportProfessionalReport: parsedPolicy.canExportProfessionalReport && !hardFailure && !hasWarning,
    issueCount: parsedIssues.length,
    issues: parsedIssues,
  });
}
