# Fix Deliberation final-delivery plugin KM request failure

## Live incident evidence

After accepted recovery task `quick-peak-1909` completed, production recovery successfully isolated historical invalid source head `b3bb1074...` at version 1 -> 2. `list-ready` immediately exposed valid record `6488c0ba...` with a complete Discord thread delivery envelope and non-null final text.

The OpenClaw plugin final-delivery service still does not reserve or deliver it. Current OpenClaw log repeatedly reports:

`deliberation: final delivery tick failed: KM request failed`

A fresh failure was recorded at 2026-08-25 11:43:09 Europe/Prague after the record became ready. Waiting multiple poll intervals leaves it `READY_TO_SEND`, with `deliveryInFlight: 0`. The canonical Python CLI can call the same KM listener and list the ready item successfully, so the failure is at the live plugin/KM-client request boundary or its deployed configuration, not spool readiness.

The current warning destroys the actionable cause (HTTP status/path/body/cause), making diagnosis impossible from production logs.

## Objective

Diagnose and fix the OpenClaw Deliberation final-delivery service so it can consume the accepted KM wire and deliver ready items, while preserving reservation/idempotency and fail-closed unknown-outcome behavior.

## Scope and requirements

1. Characterize the failure at the TypeScript KM client/service boundary with tests before changing behavior.
2. Inspect the plugin's configured KM endpoint/credential resolution and request paths/headers against the live listener contract. Find the exact mismatch; do not guess or weaken authentication/protocol validation.
3. Fix the narrow root cause in the OpenClaw fork plugin/client code and add regression coverage for the failing request.
4. Improve bounded error diagnostics so future `KM request failed` warnings include safe actionable metadata (operation/path and status or bounded non-secret cause), never credentials or message text.
5. Preserve one-reservation/one-provider-attempt semantics, destination integrity checks, and delivery-unknown handling.
6. Run focused extension tests and the smallest relevant OpenClaw build/typecheck gate.
7. Do not mutate the production spool or send a real provider message during implementation/testing. Live deployment/restart and production delivery remain separate operator actions after acceptance and Michal's existing instruction.

## Acceptance

A fixture matching the configured live endpoint proves the plugin KM client successfully lists, reserves, invokes, and completes a ready item; the prior mismatch fails before the fix and passes after it. Logs expose safe operation/status diagnostics on a simulated KM failure. No auth/protocol guard is relaxed and no delivery semantics regress.
