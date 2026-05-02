import React, { useMemo, useRef, useState } from "react";
import {
  buildStarterScenario,
  ChallengeBenchmarkSchema,
  explainSummaryDeltas,
  migrateProjectManifest,
  ProjectManifestSchema,
  ScenarioSchema,
  scorePrototypeChallenge,
  validateChallengeSubmission,
  type ChallengeBenchmark,
  type StarterTemplateId,
  type PrototypeChallengeScore,
  type Scenario,
} from "@commons-sim/shared";
import { simulateScenario } from "@commons-sim/engine";
import baseline from "../../../../scenarios/baseline-48.json";
import exampleBasic from "../../../../examples/scenarios/basic.json";
import exampleHighService from "../../../../examples/scenarios/high-service.json";
import canonicalFamily from "../../../../examples/scenarios/canonical/cn-002-family-heavy-64.json";
import canonicalLean from "../../../../examples/scenarios/canonical/cn-003-lean-service-36.json";
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

type ChallengeEntry = {
  scenario: Scenario;
  score: PrototypeChallengeScore;
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

const CHALLENGE_BENCHMARKS: ChallengeBenchmark[] = [
  buildBenchmark("balanced-48", "Balanced 48", "balanced-48", baseline, 150000, 240),
  buildBenchmark("family-heavy-64", "Family Heavy 64", "family-heavy-64", canonicalFamily, 210000, 350),
  buildBenchmark("lean-36", "Lean Service 36", "lean-36", canonicalLean, 90000, 140),
];

export default function App() {
  const [baselineId, setBaselineId] = useState("baseline-48");
  const [candidateId, setCandidateId] = useState("example-high-service");
  const [customCandidate, setCustomCandidate] = useState<any | null>(null);
  const [starterId, setStarterId] = useState<StarterTemplateId>("starter-balanced-24");
  const [challengeBenchmarkId, setChallengeBenchmarkId] = useState("balanced-48");
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

  const activeBenchmark = useMemo(
    () => CHALLENGE_BENCHMARKS.find((benchmark) => benchmark.id === challengeBenchmarkId) ?? CHALLENGE_BENCHMARKS[0]!,
    [challengeBenchmarkId],
  );

  const benchmarkOutput = useMemo(() => simulateScenario(activeBenchmark.lockedScenario), [activeBenchmark]);

  const challengeEntries = useMemo<ChallengeEntry[]>(() => {
    const scenarioById = new Map<string, Scenario>();

    for (const scenario of buildChallengeCandidateScenarios(activeBenchmark)) {
      scenarioById.set(scenario.id, scenario);
    }

    if (customCandidate && scenarioMatchesBenchmark(activeBenchmark, candidateScenario)) {
      scenarioById.set(candidateScenario.id, candidateScenario);
    }

    return Array.from(scenarioById.values())
      .map((scenario) => {
        const output = simulateScenario(scenario);
        return {
          scenario,
          score: scorePrototypeChallenge(benchmarkOutput.summary, output.summary, scenario),
        };
      })
      .sort((a, b) => b.score.totalScore - a.score.totalScore || a.scenario.title.localeCompare(b.scenario.title));
  }, [activeBenchmark, benchmarkOutput.summary, candidateScenario, customCandidate]);

  const activeChallengeScore = useMemo(
    () => scorePrototypeChallenge(benchmarkOutput.summary, candidateOutput.summary, candidateScenario),
    [benchmarkOutput.summary, candidateOutput.summary, candidateScenario],
  );

  const activeCandidateMatchesBenchmark = useMemo(
    () => scenarioMatchesBenchmark(activeBenchmark, candidateScenario),
    [activeBenchmark, candidateScenario],
  );

  const topChallengeEntry = challengeEntries[0];

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

      <section className="panel challenge-mode">
        <div className="section-heading">
          <div>
            <h2>Prototype Challenge Mode</h2>
            <p>Rank scenarios by real-world prototype strength: cost, family support, resilience, fairness, sustainability, and feasibility.</p>
          </div>
          {topChallengeEntry ? (
            <div className="top-score">
              <span>Leader</span>
              <strong>{topChallengeEntry.score.totalScore.toFixed(1)}</strong>
            </div>
          ) : null}
        </div>

        <label className="benchmark-select">
          Challenge benchmark
          <select value={challengeBenchmarkId} onChange={(e) => setChallengeBenchmarkId(e.target.value)}>
            {CHALLENGE_BENCHMARKS.map((benchmark) => (
              <option key={benchmark.id} value={benchmark.id}>
                {benchmark.title}
              </option>
            ))}
          </select>
        </label>

        <div className="challenge-grid">
          <div className="leaderboard">
            <h3>Leaderboard</h3>
            {challengeEntries.map((entry, index) => (
              <button
                key={entry.scenario.id}
                className={`leaderboard-row ${entry.scenario.id === candidateScenario.id ? "active-row" : ""}`}
                onClick={() => {
                  setCustomCandidate(entry.scenario);
                  setStatusMessage(`Loaded challenge entry: ${entry.scenario.id}`);
                }}
              >
                <span className="rank">{index + 1}</span>
                <span className="leaderboard-title">
                  <strong>{entry.scenario.title}</strong>
                  <small>{entry.score.rankLabel}</small>
                </span>
                <span className="leaderboard-score">{entry.score.totalScore.toFixed(1)}</span>
              </button>
            ))}
          </div>

          <div className="score-panel">
            <div className="score-header">
              <div>
                <h3>{candidateScenario.title}</h3>
                <p>
                  {activeCandidateMatchesBenchmark
                    ? activeChallengeScore.rankLabel
                    : `Not eligible for ${activeBenchmark.benchmarkClassId}`}
                </p>
              </div>
              <strong>
                {activeCandidateMatchesBenchmark ? activeChallengeScore.totalScore.toFixed(1) : "0.0"} /{" "}
                {activeChallengeScore.maxScore}
              </strong>
            </div>

            <div className="score-components">
              {activeChallengeScore.components.map((component) => (
                <ScoreBar key={component.key} label={component.label} score={component.score} maxScore={component.maxScore} />
              ))}
            </div>

            <div className="readiness-gates">
              <h4>Prototype Readiness Gates</h4>
              {!activeCandidateMatchesBenchmark ? (
                <div className="gate-row gate-fail">
                  <span>Needs work</span>
                  <div>
                    <strong>Benchmark eligibility</strong>
                    <small>Candidate changes locked demand, wage, utility, horizon, or household assumptions.</small>
                  </div>
                </div>
              ) : null}
              {activeChallengeScore.gates.map((gate) => (
                <div key={gate.key} className={`gate-row ${gate.passed ? "gate-pass" : "gate-fail"}`}>
                  <span>{gate.passed ? "Pass" : "Needs work"}</span>
                  <div>
                    <strong>{gate.label}</strong>
                    <small>{gate.detail}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

function ScoreBar(props: { label: string; score: number; maxScore: number }) {
  const percent = props.maxScore === 0 ? 0 : Math.max(0, Math.min(100, (props.score / props.maxScore) * 100));

  return (
    <div className="score-bar-row">
      <div className="score-bar-label">
        <span>{props.label}</span>
        <strong>
          {props.score.toFixed(1)} / {props.maxScore}
        </strong>
      </div>
      <div className="score-track" aria-hidden="true">
        <div className="score-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function buildBenchmark(
  id: string,
  title: string,
  benchmarkClassId: string,
  scenarioData: unknown,
  budgetCapUsd: number,
  maxAvgCostPerHouseholdUsd: number,
): ChallengeBenchmark {
  return ChallengeBenchmarkSchema.parse({
    benchmarkVersion: 1,
    id,
    title,
    benchmarkClassId,
    lockedScenario: ScenarioSchema.parse(scenarioData),
    budgetCapUsd,
    minimumTargets: {
      maxAvgCostPerHouseholdUsd,
      minReserveMonths: 2,
      maxBurnoutIndex: 0.6,
      minMealCoverage: 0.5,
      minLaundryCoverage: 0.5,
    },
  });
}

function buildChallengeCandidateScenarios(benchmark: ChallengeBenchmark): Scenario[] {
  const base = benchmark.lockedScenario;
  return [
    {
      ...base,
      id: `${benchmark.id}-status-quo`,
      title: `${benchmark.title} Status Quo`,
    },
    {
      ...base,
      id: `${benchmark.id}-lean-ops`,
      title: `${benchmark.title} Lean Operations`,
      participation: {
        meals: Math.max(0.5, base.participation.meals * 0.86),
        laundry: Math.max(0.5, base.participation.laundry * 0.9),
        cleaning: Math.max(0.25, base.participation.cleaning * 0.8),
      },
      serviceTiers: {
        meals: Math.max(1, base.serviceTiers.meals - 1),
        laundry: Math.max(1, base.serviceTiers.laundry),
        cleaning: Math.max(0, base.serviceTiers.cleaning - 1),
      },
    },
    {
      ...base,
      id: `${benchmark.id}-family-support`,
      title: `${benchmark.title} Family Support`,
      participation: {
        meals: Math.min(1, base.participation.meals * 1.1),
        laundry: Math.min(1, base.participation.laundry * 1.08),
        cleaning: Math.min(1, base.participation.cleaning * 1.12),
      },
      serviceTiers: {
        meals: Math.min(3, base.serviceTiers.meals + 1),
        laundry: Math.min(3, base.serviceTiers.laundry + 1),
        cleaning: base.serviceTiers.cleaning,
      },
      reservePolicy: {
        ...base.reservePolicy,
        targetMonthsOfOpex: Math.max(base.reservePolicy.targetMonthsOfOpex, 4),
      },
    },
  ].map((scenario) => ScenarioSchema.parse(scenario));
}

function scenarioMatchesBenchmark(benchmark: ChallengeBenchmark, scenario: Scenario) {
  const submission = {
    submissionVersion: 1 as const,
    id: `${scenario.id}-ui-check`,
    benchmarkId: benchmark.id,
    title: scenario.title,
    authorDisplayName: "web",
    createdAtUtc: "2026-05-01T00:00:00.000Z",
    proposedScenario: scenario,
    designNotes: "UI eligibility check.",
    declaredRisks: [],
  };
  return validateChallengeSubmission(benchmark, submission).ok;
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
