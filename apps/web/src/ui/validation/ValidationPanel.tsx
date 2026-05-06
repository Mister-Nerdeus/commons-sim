import type { ModeValidationResult } from "@commons-sim/shared";
import type { GroupedValidationIssues } from "../builder/builderTypes";

export function ValidationPanel(props: { result: ModeValidationResult }) {
  const grouped = groupValidationIssues(props.result);
  return (
    <aside className="builder-panel validation-panel">
      <h3>Validation</h3>
      <div className="validation-summary">
        <span>{props.result.canSave ? "Save enabled" : "Save blocked"}</span>
        <span>{props.result.canSimulate ? "Simulation enabled" : "Simulation unavailable"}</span>
      </div>
      <IssueGroup title="Blocking" issues={grouped.blocking} />
      <IssueGroup title="Errors" issues={grouped.errors} />
      <IssueGroup title="Warnings" issues={grouped.warnings} />
      <IssueGroup title="Info" issues={grouped.info} />
    </aside>
  );
}

function groupValidationIssues(result: ModeValidationResult): GroupedValidationIssues {
  return {
    blocking: result.issues.filter((issue) => issue.severity === "blocking"),
    errors: result.issues.filter((issue) => issue.severity === "error"),
    warnings: result.issues.filter((issue) => issue.severity === "warning"),
    info: result.issues.filter((issue) => issue.severity === "info"),
  };
}

function IssueGroup(props: { title: string; issues: ModeValidationResult["issues"] }) {
  return (
    <div className="issue-group">
      <h4>
        {props.title} <span>{props.issues.length}</span>
      </h4>
      {props.issues.map((issue) => (
        <div key={`${issue.code}-${issue.path}-${issue.severity}`} className={`issue issue-${issue.severity}`}>
          <strong>{issue.code}</strong>
          <span>{issue.message}</span>
        </div>
      ))}
    </div>
  );
}
