# Migration Notes

## Contract Change
Date: 2026-04-19

This release introduces explicit output contract version markers:
- `meta.modelVersion`
- `meta.assumptionSetVersion`

`meta.engineVersion` remains for backward compatibility.

## Breaking/Behavioral Changes
- Semantic fixes from Issue #6 changed outputs for some scenarios:
  - reserve target now affects reserve trajectory
  - gas utility price affects costs
  - burnout metric no longer collapses to zero
- Output metadata additions in Issue #7 (`modelVersion`, `assumptionSetVersion`) changed the serialized baseline hash again:
  - after Issue #6: `3ca9862b42535fc7864d955e3e33c5a851037a13fc500a4ef17b2468d957f444`
  - current: `8c9372a7e9a23f95a20ae0fa5bd4d5dab6e0856e2e08c61af3c50428f920c08e`

## Consumer Guidance
- If consumers read `meta` strictly, add support for `modelVersion` and `assumptionSetVersion`.
- If consumers rely on baseline snapshot hashes, update expected snapshots to the new baseline.
- No input-schema field removals in this migration.
