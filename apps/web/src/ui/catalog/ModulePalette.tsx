export function ModulePalette() {
  const modules = ["Housing placeholder", "Community kitchen", "Laundry", "Utility corridor", "Green space"];
  return (
    <aside className="builder-panel module-palette">
      <h3>Module Palette</h3>
      <div className="module-list">
        {modules.map((module) => (
          <button key={module} type="button">
            {module}
          </button>
        ))}
      </div>
    </aside>
  );
}
