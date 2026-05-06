import { useMemo, useState } from "react";
import {
  evaluateModeValidation,
  getDefaultModePolicy,
  LayoutGraphSchema,
  ProjectManifestV2Schema,
  type DesignMode,
  type ModeValidationIssue,
} from "@commons-sim/shared";
import generatedProject from "../../../../../examples/generated/polygon-garden-village-24gon.seed-1337.project-v2.json";
import layoutFixture from "../../../../../examples/layouts/polygon-garden-village-24gon.layout.json";
import { ModulePalette } from "../catalog/ModulePalette";
import { LayoutCanvas } from "../layout/LayoutCanvas";
import { ModeSelector } from "../modes/ModeSelector";
import { ProjectSummaryPanel } from "../projects/ProjectSummaryPanel";
import { ValidationPanel } from "../validation/ValidationPanel";

export function BuilderShell() {
  const baseProject = useMemo(() => ProjectManifestV2Schema.parse(generatedProject), []);
  const layout = useMemo(() => LayoutGraphSchema.parse(layoutFixture), []);
  const [activeMode, setActiveMode] = useState<DesignMode>("dream");
  const [selectedLayoutNodeId, setSelectedLayoutNodeId] = useState<string | undefined>(layout.nodes[0]?.id);

  const validationResult = useMemo(() => {
    const policy = getDefaultModePolicy(activeMode);
    const issues = buildBuilderIssues(activeMode);
    return evaluateModeValidation(policy, issues);
  }, [activeMode]);

  const activeProject = useMemo(
    () =>
      ProjectManifestV2Schema.parse({
        ...baseProject,
        designMode: activeMode,
        validationResults: [validationResult],
      }),
    [activeMode, baseProject, validationResult],
  );

  const state = { activeMode, activeProject, selectedLayoutNodeId, validationResult };

  const exportProject = () => {
    const blob = new Blob([JSON.stringify(activeProject, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeProject.projectId}.project-v2.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="builder-shell">
      <section className="builder-toolbar">
        <ModeSelector activeMode={activeMode} onModeChange={setActiveMode} />
        <div className={`mode-boundary mode-${activeMode}`}>{modeBoundaryText(activeMode)}</div>
      </section>

      <section className="builder-grid">
        <ProjectSummaryPanel state={state} onExport={exportProject} />
        <div className="builder-stage">
          <LayoutCanvas layout={layout} selectedLayoutNodeId={selectedLayoutNodeId} onSelectNode={setSelectedLayoutNodeId} />
        </div>
        <div className="builder-sidebar">
          <ValidationPanel result={validationResult} />
          <ModulePalette />
        </div>
      </section>
    </main>
  );
}

function buildBuilderIssues(mode: DesignMode): ModeValidationIssue[] {
  if (mode === "dream") {
    return [
      {
        code: "incomplete-design",
        severity: "warning",
        path: "designDocument",
        message: "Dream Mode can save incomplete generated layouts.",
        mode,
        canUserOverride: true,
      },
    ];
  }

  if (mode === "challenge") {
    return [
      {
        code: "locked-benchmark-required",
        severity: "blocking",
        path: "compiledScenario",
        message: "Challenge Mode requires locked benchmark constraints before submission.",
        mode,
        canUserOverride: false,
      },
    ];
  }

  if (mode === "professional") {
    return [
      {
        code: "provenance-gap",
        severity: "blocking",
        path: "metadata",
        message: "Professional Mode requires stronger provenance and real-world binding.",
        mode,
        canUserOverride: false,
      },
    ];
  }

  return [
    {
      code: "compiled-scenario-missing",
      severity: mode === "research" ? "error" : "warning",
      path: "compiledScenario",
      message: "Scenario V1 compilation is not attached to this generated layout.",
      mode,
      canUserOverride: mode === "soft-sim",
    },
  ];
}

function modeBoundaryText(mode: DesignMode) {
  if (mode === "dream") return "Warnings are visible; saving stays available.";
  if (mode === "challenge") return "Locked benchmark constraints are enforced.";
  if (mode === "professional") return "Provenance gaps block professional export.";
  if (mode === "research") return "Reproducibility gaps block strict validation.";
  return "Consequences are shown without leaderboard or report claims.";
}
