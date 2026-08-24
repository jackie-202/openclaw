---
title: Deliberation: repair completion and receipt semantics
---

# Deliberation: repair completion and receipt semantics

## Context

Remediation item 5 from `plans/investigations/quick-wave-9858_audit-openclaw-deliberation-pipeline-routing-and-delivery-safety.md` (`NOT SAFE`). Depends on the single-provider-attempt task.

## Objective

Persist completion evidence that represents exactly one known platform outcome and fail closed when acceptance is unknown or attempt identity is ambiguous.

## Required behavior

- Treat transport timeout/accepted-then-error after invocation as unresolved/unknown, not definitive failed completion.
- Reject Discord `messageId: "unknown"` and missing/noncanonical receipt evidence.
- Reject duplicate KM provider-attempt IDs rather than selecting the first match.
- Require one receipt/message pair for exactly one platform message and preserve exact replay/conflict semantics.
- Align strict runtime record parsing with all schema-permitted projection fields, or explicitly narrow the schema and fixtures together.

## Acceptance

- Focused tests cover unknown transport outcome, duplicate attempt IDs, unknown Discord receipt, exact replay and receipt/message conflicts.
- No path fabricates or collapses multi-attempt/multi-message evidence into one successful completion.
- Focused Deliberation client/final-adapter and composed provider tests pass.
