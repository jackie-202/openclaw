# Fix recurring Deliberation intake transport failure after Gateway restart

## Problem
The final sender is live and has successfully delivered one existing `READY_TO_SEND` record, but subsequent Discord messages never enter the Deliberation spool.

Live evidence on 2026-08-13:
- Discord source channel `1494265174389948538` contains messages `1537451071667052684` (15:21 local) and `1537472479038283878` (16:46 local).
- Neither message produced a new spool record; the newest record remains `86a0453a...`, opened at 12:49 local and later delivered successfully.
- Gateway logs contain one warning for each missing message: `deliberation intake failed: reason=km-request-failed stage=transport code=UNKNOWN error=Error`.
- KM health currently reports `status: ok`, controls including `source-intake: true`, and idle queues. This indicates an intake transport/connectivity/runtime wiring failure before persistence, not a draft/review/sender stall.

## Objective
Diagnose and fix the recurring OpenClaw Deliberation plugin intake transport failure so every eligible Discord message reaches the existing KM intake endpoint after normal Gateway startup/restart, while preserving the existing final sender and KM protocol.

## Scope
- Work only in the OpenClaw fork Deliberation plugin/runtime and its focused tests/docs where needed.
- Do not modify KM implementation, cron jobs, spool state, credentials, or external configuration unless the repository implementation is proven correct and the final note explicitly identifies an external blocker.
- Do not create a second intake or delivery mechanism.
- Preserve fail-closed behavior and sanitized logs; never log tokens, authorization headers, full payloads, prompts, credentials, or full environment.

## Required investigation
1. Reproduce or characterize why `KmClient.intake()` reports `stage=transport code=UNKNOWN` while the KM service is healthy and final sender calls can work.
2. Inspect plugin startup/lifecycle, KM endpoint/token resolution, request transport, IPv4/IPv6 or connection reuse behavior, and restart ordering as relevant.
3. Establish whether failures are transient startup races or persistent runtime failure; use bounded retry/backoff only if justified and idempotency remains intact.
4. Improve safe diagnostics enough to distinguish the actual transport class without exposing sensitive data.

## Acceptance
- Focused characterization test fails before the fix and passes after it for the identified failure mode.
- Eligible inbound Discord intake reaches KM reliably after plugin/Gateway startup, including the relevant restart/startup timing scenario.
- Duplicate/retry behavior remains idempotent and fail-closed.
- Existing final sender behavior remains unchanged and its focused tests pass.
- Run the focused Deliberation suite plus the smallest relevant broader plugin/build/typecheck gate.
- Final note records root cause, changed files, exact verification commands/results, and any deploy/restart requirement.
