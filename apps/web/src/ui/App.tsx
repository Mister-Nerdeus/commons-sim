import React, { useMemo, useState } from "react";
import { ScenarioSchema } from "@commons-sim/shared";
import { simulateScenario } from "@commons-sim/engine";
import baseline from "../../../../scenarios/baseline-48.json";

export default function App() {
  const [seed, setSeed] = useState<number>((baseline as any).seed ?? 1337);

  const scenario = useMemo(() => {
    const parsed = ScenarioSchema.parse({ ...(baseline as any), seed });
    return parsed;
  }, [seed]);

  const output = useMemo(() => simulateScenario(scenario), [scenario]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1>commons-sim</h1>
      <p>Deterministic planning simulator (Phase 1).</p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>
          Seed:&nbsp;
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
            style={{ width: 140 }}
          />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card title="Avg cost / household (monthly)">
          ${output.summary.avgCostPerHouseholdUsd.toFixed(2)}
        </Card>
        <Card title="Avg labor hours / month">{output.summary.avgLaborHoursPerMonth.toFixed(1)}</Card>
        <Card title="Reserve (end)">${output.summary.reserveEndUsd.toFixed(0)}</Card>
        <Card title="Avg burnout index">{output.summary.avgBurnoutIndex.toFixed(3)}</Card>
      </div>

      <h2 style={{ marginTop: 20 }}>Notes</h2>
      <ul>
        <li>Utilities and labor coefficients are Phase 1 placeholders.</li>
        <li>Determinism snapshot is enforced in CI.</li>
      </ul>
    </div>
  );
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
      <div style={{ opacity: 0.7, marginBottom: 6 }}>{props.title}</div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{props.children}</div>
    </div>
  );
}
