# ProjectManifestV2

ProjectManifestV2 is the editable project format for freeform design work.

Scenario V1 remains the compiled simulation input. V2 can contain an optional `compiledScenario`, but Dream Mode projects can be saved without one.

V2 separates:

- `designDocument`: creative project description and references.
- `compiledScenario`: optional deterministic Scenario V1 input.
- `validationResults`: mode-aware validation evidence.
- `aiProposals`: proposal-plane drafts, not truth-plane assertions.

Non-claims:

- V2 does not execute simulation by itself.
- V2 does not implement layout graph compilation.
- V2 does not approve professional reports.
