import type { DesignMode } from "@commons-sim/shared";

const MODES: Array<{ mode: DesignMode; label: string }> = [
  { mode: "dream", label: "Dream" },
  { mode: "soft-sim", label: "Soft Sim" },
  { mode: "challenge", label: "Challenge" },
  { mode: "professional", label: "Professional" },
  { mode: "research", label: "Research" },
];

export function ModeSelector(props: { activeMode: DesignMode; onModeChange: (mode: DesignMode) => void }) {
  return (
    <div className="mode-selector" aria-label="Design mode">
      {MODES.map((mode) => (
        <button
          key={mode.mode}
          className={props.activeMode === mode.mode ? "active-mode" : ""}
          onClick={() => props.onModeChange(mode.mode)}
          type="button"
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
