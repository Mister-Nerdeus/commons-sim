# Scenario Compilation

`compileToScenarioV1` is a narrow adapter from supported ProjectManifestV2 content to Scenario V1.

The current supported subset is an attached `compiledScenario`. LayoutGraph, AI proposals, module graphs, product binding, BOM export, and report export are not compiled by this adapter.

Unsupported Dream Mode content returns warnings without crashing. Unsupported Challenge, Professional, and Research content can block.

Non-claims:

- This is not a full graph compiler.
- This is not a module execution runtime.
- This does not change `simulateScenario`.
