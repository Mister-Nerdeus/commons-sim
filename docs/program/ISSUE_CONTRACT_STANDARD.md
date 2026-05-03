# Issue Contract Standard

## Required Sections

Every Codex execution issue must use these sections in order:

1. `Issue Contract`
2. `Problem`
3. `Files to touch or create`
4. `Invariants`
5. `Plan`
6. `Required Output Structure`
7. `Definition of Done`
8. `Acceptance Gates`
9. `Closeout Evidence`
10. `Risks / Open Questions`

## Section Purpose

`Files to touch or create` pins the expected code, documentation, fixture, and artifact paths before work begins. `Required Output Structure` defines the shape of schemas, command output, documents, fixtures, or audit evidence so completion can be checked mechanically where possible.

## Non-Negotiable Evidence Rules

Acceptance gates must be objective and testable. Closeout evidence is mandatory and must include changed-file summaries, command transcripts, and any required generated artifacts.

## Scope-Control Rules

Issues must explicitly state invariants and non-goals. If an issue is schema-only, it must not silently implement runtime behavior, engine execution, graph compilation, bindings, UI, or migrations.

## Audit Expectations

Blocking audit issues compare claimed completion against observed repository state. Audits must list known gaps, explicit non-claims, and a clear GO/NO-GO decision for the next issue.
