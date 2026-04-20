# ADR-003: CLI Reliability Contract

## Status
Accepted

## Context
CLI behavior needed stable automation semantics and clearer error handling.

## Decision
- Support `validate`, `run`, and `compare` commands.
- Use stable exit codes and machine-readable error payloads.
- Add CLI integration tests for success and failure paths.

## Consequences
- CLI is script-safe and auditable.
- Documentation and tests define the user-facing command contract.
