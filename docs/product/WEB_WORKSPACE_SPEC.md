# Web Workspace Spec

## Goal
Enable baseline-versus-candidate scenario comparison where users can quickly answer: what changed and why it matters.

## Primary Flow
1. Select baseline scenario.
2. Select candidate scenario.
3. Review delta cards for key metrics.
4. Inspect assumption warnings and assumption registry.
5. Export comparison report.

## Metric Labeling Rules
- Every metric card displays:
  - metric label
  - baseline value
  - candidate value
  - signed delta
- Displayed metrics map directly to engine output summary fields.

## Traceability Requirements
- Scenario IDs are visible.
- `modelVersion` and `assumptionSetVersion` are visible.
- Assumption registry lists high-impact input assumptions side-by-side.

## Routes / Components
- Route: `apps/web/src/ui/App.tsx`
- Key components:
  - selector panel
  - meta cards
  - delta card grid
  - assumption warnings panel
  - assumption registry table
  - export report action
