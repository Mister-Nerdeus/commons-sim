# Mode Policy

ModePolicy defines validation severity by design mode.

Dream Mode is permissive: incomplete creative designs can be saved with warnings. Soft Simulation can explain consequences without leaderboard or professional claims. Challenge Mode enforces locked benchmark constraints. Professional Mode requires stronger provenance and real-world binding. Research Mode emphasizes reproducibility.

The contract is implemented in `packages/shared/src/modePolicy.ts` and `packages/shared/src/modeValidation.ts`.

Non-goals:

- No UI behavior is implemented here.
- No graph compiler is implemented here.
- No engine execution behavior changes here.
