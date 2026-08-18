# Pin Deliberation draft continuations to the current attempt payload

## Problem

A Deliberation v2 rewrite dispatch for attempt 3 reached an existing drafting session after an OpenClaw runtime continuation event. The continuation resumed stale attempt-2 context and attempted to rewrite `attempt-2.result.json` through the generic `write` tool instead of processing `attempt-3.payload.json`. The memory-flush guard rejected that write, and no attempt-3 result was produced.

Observed evidence:

- Current dispatch correlation: `7e7a5f0bbd83452760566490ef00ade7ba94649fb65c32e080b8f7075215e958`
- Current payload: `.../attempt-3.payload.json`
- Stale target attempted by continuation: `.../attempt-2.result.json`
- Rejection: `Memory flush writes are restricted to memory/2026-08-17.md; use that path only.`

## Goal

Make each Deliberation drafting dispatch self-contained and attempt-pinned so a resumed session cannot reuse an earlier attempt's payload, correlation ID, result path, or tool action.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify the KM repository or external configuration. The evidence and required cross-system contract are fully stated here. Record an unknown/follow-up instead of crossing the repository boundary.

## Required behavior

1. Treat every internal Deliberation drafting request as a fresh authoritative request, even when delivered into an existing channel/session after a continuation event.
2. Bind these values together from the current dispatch and reject any stale mismatch before an agent/tool can act:
   - request kind and attempt/revision,
   - correlation ID,
   - payload path,
   - expected result path,
   - reply/run identifier.
3. Do not let a generic runtime continuation such as `Continue the OpenClaw runtime event.` replay the previous assistant tool call or previous attempt metadata.
4. Prefer deterministic runtime-owned handling over asking the language model to infer which attempt is current. The agent should receive one explicit current-attempt envelope and one canonical result-recording route.
5. Preserve drafting-only isolation and source-channel send restrictions.
6. Preserve camelCase JSON wire names. Do not add snake_case aliases.
7. Do not weaken the memory-flush/write guard to make the stale write succeed.

## Tests

Add a regression that reproduces the exact sequence:

1. attempt 1 completes,
2. attempt 2 completes,
3. attempt 3 is dispatched to the same drafting session with a continuation event present,
4. only attempt 3 payload/correlation/result path are used,
5. no write or command targets attempt 2,
6. attempt 3 produces its result exactly once.

Also cover fail-closed behavior when the current dispatch envelope contains inconsistent correlation/payload/result identifiers. Tests must not call a real external provider or transport.

## Verification

Run the focused Deliberation/runtime continuation tests and the smallest relevant broader suite. Record exact commands and results in the final note.

## Acceptance

- The exact stale-attempt regression fails before the fix and passes after it.
- A continued drafting session cannot replay a previous attempt's tool action or result path.
- Mismatched attempt metadata fails before side effects.
- Existing Deliberation drafting isolation remains intact.
