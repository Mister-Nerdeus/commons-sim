import type { DesignMode, ModeValidationIssue, ModeValidationResult, ProjectManifestV2 } from "@commons-sim/shared";

export type BuilderState = {
  activeMode: DesignMode;
  activeProject: ProjectManifestV2;
  selectedLayoutNodeId?: string;
  validationResult: ModeValidationResult;
};

export type GroupedValidationIssues = {
  blocking: ModeValidationIssue[];
  errors: ModeValidationIssue[];
  warnings: ModeValidationIssue[];
  info: ModeValidationIssue[];
};
