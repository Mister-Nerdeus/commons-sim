import React, { useMemo, useRef, useState } from "react";
import {
  buildStarterScenario,
  explainSummaryDeltas,
  migrateProjectManifest,
  ProjectManifestSchema,
  ScenarioSchema,
  type StarterTemplateId,
} from "@commons-sim/shared";
import { simulateScenario } from "@commons-sim/engine";
import baseline from "../../../../scenarios/baseline-48.json";
import exampleBasic from "../../../../examples/scenarios/basic.json";
import exampleHighService from "../../../../examples/scenarios/high-service.json";
import "./app.css";

type ScenarioOption = {
  id: string;
  label: string;
  data: any;
};

type MetricFormat = "usd" | "hours" | "index";

type MetricDelta = {
  key: string;
  label: string;
  baseline: number;
  candidate: number;
  format: MetricFormat;
};

const SCENARIO_OPTIONS: ScenarioOption[] = [
  { id: "baseline-48", label: "Baseline 48", data: baseline },
  { id: "example-basic", label: "Example Basic", data: exampleBasic },
  { id: "example-high-service", label: "Example High Service", data: exampleHighService },
];

const STARTER_TEMPLATES: Array<{ id: StarterTemplateId; label: string; summary: string }> = [
  { id: "starter-balanced-24", label: "Starter Balanced 24", summary: "Mixed household distribution" },
  { id: "starter-family-48", label: "Starter Family Focus 48", summary: "Higher family participation and demand" },
  { id: "starter-lean-18", label: "Starter Lean 18", summary: "Lower service intensity and reserve target" },
];

export default function App() {
  const [baselineId, setBaselineId] = useState("baseline-48");
  const [candidateId, setCandidateId] = useState("example-high-service");
  const [customCandidate, setCustomCandidate] = useState<any | null>(null);
  const [starterId, setStarterId] = useState<StarterTemplateId>("starter-balanced-24");
  const [statusMessage, setStatusMessage] = useState("No project actions yet.");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const baselineScenario = useMemo(() => {
    const selected = SCENARIO_OPTIONS.find((s) => s.id === baselineId) ?? SCENARIO_OPTIONS[0]!;
    return ScenarioSchema.parse(selected.data);
  }, [baselineId]);

  const candidateScenario = useMemo(() => {
    if (customCandidate) return ScenarioSchema.parse(customCandidate);
    const selected = SCENARIO_OPTIONS.find((s) => s.id === candidateId) ?? SCENARIO_OPTIONS[1]!;
    return ScenarioSchema.parse(selected.data);
  }, [candidateId, customCandidate]);

  const baselineOutput = useMemo(() => simulateScenario(baselineScenario), [baselineScenario]);
  const candidateOutput = useMemo(() => simulateScenario(candidateScenario), [candidateScenario]);

  const deltas = useMemo<MetricDelta[]>(
    () => [
      {
        key: "avgCostPerHouseholdUsd",
        label: "Avg Cost / Household",
        baseline: baselineOutput.summary.avgCostPerHouseholdUsd,
        candidate: candidateOutput.summary.avgCostPerHouseholdUsd,
        format: "usd",
      },
      {
        key: "avgLaborHoursPerMonth",
        label: "Avg Labor Hours / Month",
        baseline: baselineOutput.summary.avgLaborHoursPerMonth,
        candidate: candidateOutput.summary.avgLaborHoursPerMonth,
        format: "hours",
      },
      {
        key: "reserveEndUsd",
        label: "Reserve End",
        baseline: baselineOutput.summary.reserveEndUsd,
        candidate: candidateOutput.summary.reserveEndUsd,
        format: "usd",
      },
      {
        key: "avgBurnoutIndex",
        label: "Avg Burnout Index",
        baseline: baselineOutput.summary.avgBurnoutIndex,
        candidate: candidateOutput.summary.avgBurnoutIndex,
        format: "index",
      },
    ],
    [baselineOutput, candidateOutput],
  );

  const explainabilityLines = useMemo(
    () => explainSummaryDeltas(baselineOutput.summary, candidateOutput.summary),
    [baselineOutput.summary, candidateOutput.summary],
  );

  const assumptionsWarnings = useMemo(() => {
    const warnings: string[] = [];
    if ((candidateScenario.utilities.gas_therm ?? 0) > (baselineScenario.utilities.gas_therm ?? 0)) {
      warnings.push("Candidate uses a higher gas therm price assumption.");
    }
    if (candidateScenario.wageModel.overheadMultiplier > baselineScenario.wageModel.overheadMultiplier) {
      warnings.push("Candidate assumes higher labor overhead multiplier.");
    }
    if (candidateScenario.reservePolicy.targetMonthsOfOpex > baselineScenario.reservePolicy.targetMonthsOfOpex) {
      warnings.push("Candidate targets a larger reserve buffer.");
    }
    return warnings;
  }, [baselineScenario, candidateScenario]);

  const assumptionRegistry = useMemo(
    () => [
      {
        key: "wageModel.fullyLoadedUsdPerHour",
        baseline: baselineScenario.wageModel.fullyLoadedUsdPerHour,
        candidate: candidateScenario.wageModel.fullyLoadedUsdPerHour,
      },
      {
        key: "wageModel.overheadMultiplier",
        baseline: baselineScenario.wageModel.overheadMultiplier,
        candidate: candidateScenario.wageModel.overheadMultiplier,
      },
      {
        key: "utilities.gas_therm",
        baseline: baselineScenario.utilities.gas_therm ?? 0,
        candidate: candidateScenario.utilities.gas_therm ?? 0,
      },
      {
        key: "reservePolicy.targetMonthsOfOpex",
        baseline: baselineScenario.reservePolicy.targetMonthsOfOpex,
        candidate: candidateScenario.reservePolicy.targetMonthsOfOpex,
      },
      {
        key: "serviceTiers.meals",
        baseline: baselineScenario.serviceTiers.meals,
        candidate: candidateScenario.serviceTiers.meals,
      },
    ],
    [baselineScenario, candidateScenario],
  );

  const applyStarterTemplate = () => {
    const generated = buildStarterScenario(starterId);
    setCustomCandidate(generated);
    setStatusMessage(`Applied starter template: ${generated.id}`);
  };

  const saveProjectManifest = () => {
    const now = new Date().toISOString();
    const manifest = ProjectManifestSchema.parse({
      manifestVersion: 1,
      projectId: candidateScenario.id,
      projectTitle: candidateScenario.title,
      createdAtUtc: now,
      updatedAtUtc: now,
      sourceBranch: "develop",
      scenario: candidateScenario,
      metadata: {
        notes: "Saved from guided planning wizard",
        engineVersion: candidateOutput.meta.engineVersion,
      },
    });

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${manifest.projectId}.project.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage(`Saved project manifest: ${manifest.projectId}`);
  };

  const onLoadManifestClick = () => fileInputRef.current?.click();

  const onManifestSelected: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const migrated = migrateProjectManifest(parsed);
        setCustomCandidate(migrated.manifest.scenario);
        setStatusMessage(
          migrated.migratedFrom === null
            ? `Loaded manifest v1: ${migrated.manifest.projectId}`
            : `Loaded and migrated manifest v${migrated.migratedFrom}: ${migrated.manifest.projectId}`,
        );
      } catch (error) {
        setStatusMessage(`Manifest load failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <div className="workspace-shell">
      <header className="hero">
        <div>
          <h1>Scenario Comparison Workspace</h1>
          <p>Guided project creation, explainability, and persistence-aware release comparison.</p>
        </div>
      </header>

      <section className="panel wizard-panel">
        <h2>Guided Planning Wizard</h2>
        <div className="wizard-controls">
          <label>
            Starter template
            <select value={starterId} onChange={(e) => setStarterId(e.target.value as StarterTemplateId)}>
              {STARTER_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </label>
          <button className="export-button" onClick={applyStarterTemplate}>
            Create Project
          </button>
          <button className="export-button" onClick={saveProjectManifest}>
            Save Project Manifest
          </button>
          <button className="export-button" onClick={onLoadManifestClick}>
            Load Project Manifest
          </button>
          <input ref={fileInputRef} className="hidden-input" type="file" accept=".json" onChange={onManifestSelected} />
        </div>
        <p className="status-line">{statusMessage}</p>
      </section>

      <section className="panel selectors">
        <label>
          Baseline scenario
          <select value={baselineId} onChange={(e) => setBaselineId(e.target.value)}>
            {SCENARIO_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Candidate scenario
          <select
            value={customCandidate ? "__custom__" : candidateId}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "__custom__") return;
              setCustomCandidate(null);
              setCandidateId(value);
            }}
          >
            {SCENARIO_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
            <option value="__custom__">Custom (wizard/loaded manifest)</option>
          </select>
        </label>
      </section>

      <section className="panel meta-grid">
        <MetaCard title="Baseline" value={baselineScenario.id} />
        <MetaCard title="Candidate" value={candidateScenario.id} />
        <MetaCard title="Model Version" value={candidateOutput.meta.modelVersion} />
        <MetaCard title="Assumption Set" value={candidateOutput.meta.assumptionSetVersion} />
      </section>

      <section className="panel">
        <h2>Delta Cards</h2>
        <div className="delta-grid">
          {deltas.map((metric) => (
            <DeltaCard key={metric.key} metric={metric} />
          ))}
        </div>
      </section>

      <section className="panel assumptions">
        <h2>Explainability Layer</h2>
        <ul>
          {explainabilityLines.map((line: string) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="panel assumptions">
        <h2>Assumption Warnings</h2>
        {assumptionsWarnings.length === 0 ? (
          <p>No major assumption differences detected.</p>
        ) : (
          <ul>
            {assumptionsWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel assumptions">
        <h2>Assumption Registry</h2>
        <table className="assumption-table">
          <thead>
            <tr>
              <th>Assumption</th>
              <th>Baseline</th>
              <th>Candidate</th>
            </tr>
          </thead>
          <tbody>
            {assumptionRegistry.map((item) => (
              <tr key={item.key}>
                <td>{item.key}</td>
                <td>{item.baseline}</td>
                <td>{item.candidate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function MetaCard(props: { title: string; value: string }) {
  return (
    <div className="meta-card">
      <div className="meta-title">{props.title}</div>
      <div className="meta-value">{props.value}</div>
    </div>
  );
}

function DeltaCard(props: { metric: MetricDelta }) {
  const delta = props.metric.candidate - props.metric.baseline;
  const directionClass = delta > 0 ? "delta-up" : delta < 0 ? "delta-down" : "delta-flat";

  return (
    <article className="delta-card">
      <h3>{props.metric.label}</h3>
      <p className="baseline">Baseline: {formatValue(props.metric.baseline, props.metric.format)}</p>
      <p className="candidate">Candidate: {formatValue(props.metric.candidate, props.metric.format)}</p>
      <p className={`delta ${directionClass}`}>Delta: {formatDelta(delta, props.metric.format)}</p>
    </article>
  );
}

function formatValue(value: number, format: MetricFormat) {
  if (format === "usd") return `$${value.toFixed(2)}`;
  if (format === "hours") return `${value.toFixed(1)}h`;
  return value.toFixed(3);
}

function formatDelta(value: number, format: MetricFormat) {
  const prefix = value > 0 ? "+" : "";
  if (format === "usd") return `${prefix}$${value.toFixed(2)}`;
  if (format === "hours") return `${prefix}${value.toFixed(1)}h`;
  return `${prefix}${value.toFixed(3)}`;
}
