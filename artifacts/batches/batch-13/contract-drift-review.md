# Batch 13 Contract Drift Review

## Issue Template

Observed drift: the template lacked explicit `Files to touch or create` and `Required Output Structure` sections.

Correction: the template now includes the exact required section order and the issue contract standard documents section purpose, evidence rules, scope-control rules, and audit expectations.

## CLI Envelope

Observed drift: registry validation failures returned an error object but no top-level `ok: false`.

Correction: CLI errors now include top-level `ok: false`. Registry validation success keeps `ok: true`, registry id, and module count.

## Terminal IDs

Observed drift: terminal fixtures used legacy hyphen-only ids such as `food-input` and `meal-output`.

Correction: module terminal ids and graph edge terminal references now require semantic namespaced ids matching `^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$`.

## Remaining Drift

No blocking drift remains for Phase C preflight. Cross-file graph edge compatibility is not implemented and remains a known future validation improvement.
