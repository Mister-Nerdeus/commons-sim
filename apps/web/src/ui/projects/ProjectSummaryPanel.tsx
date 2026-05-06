import type { BuilderState } from "../builder/builderTypes";

export function ProjectSummaryPanel(props: { state: BuilderState; onExport: () => void }) {
  return (
    <aside className="builder-panel project-summary">
      <h3>{props.state.activeProject.projectTitle}</h3>
      <dl>
        <div>
          <dt>Mode</dt>
          <dd>{props.state.activeMode}</dd>
        </div>
        <div>
          <dt>Project</dt>
          <dd>{props.state.activeProject.projectId}</dd>
        </div>
        <div>
          <dt>Selected</dt>
          <dd>{props.state.selectedLayoutNodeId ?? "none"}</dd>
        </div>
      </dl>
      <button className="export-button" type="button" onClick={props.onExport}>
        Export ProjectManifestV2
      </button>
    </aside>
  );
}
