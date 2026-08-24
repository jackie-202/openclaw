# Plan 2026-08-23: Converge OpenClaw with supplied immutable KM Deliberation owner bundle

Reconcile the plugin-owned producer, client, adapter, mirrors, and owner-runtime gate against one pinned KM revision without changing or operating KM.

## Analysis

- `extensions/deliberation/src/intake.ts` and `extensions/deliberation/scripts/intake-producer.ts` already issue one intake request per admitted event; preserve that path and remove grouping authority only where owner-backed tests show it remains.
- `extensions/deliberation/src/km-client.ts` still accepts weak retained-attempt evidence and does not validate every historical attempt against all admitted pipeline/source/target/envelope/receipt facts.
- `extensions/deliberation/src/final-adapter.ts` already orders reserve -> durable invoke -> one provider call -> completion and leaves ambiguous outcomes unresolved; modify it only for a pinned-owner failure.
- `extensions/deliberation/scripts/km-spool-probe.py` and `extensions/deliberation/scripts/km-listener.cross-repo.ts` still use burst-era preparation/assertions and aggregate test names.
- The pinned owner contract retains compatibility projections such as exact-one `messages` and `debounceUntil`; mirror them exactly, but do not use them as aggregation or retry authority.
- The four supplied artifacts are tracked and clean and their working-tree and `79bbc5c0426bc7be901d5199da11b21213bfa008` hashes match the bundle. Current `/Users/michal/.openclaw` `HEAD` is `88a3fa1c9e1cd4eda0acd2cbbd470d2684c5b8c9`, so implementation must fail closed until the approved checkout itself reports the supplied revision; do not checkout/reset or otherwise alter KM from this task.

## Available Skills

- `tdd`: preserve the genuine historical RED and capture fresh GREEN for the same owner-backed boundary.
- `openclaw-testing`: select focused plugin and changed-surface verification.
- `validate-implementation`: check owner/plugin boundaries and task constraints after implementation.
- `autoreview`: run the mandatory fresh pre-handoff review and resolve actionable findings.
- `save-learning`: run as the final implementation action, with no subsequent edits or commands.

## Knowledge Applied

- Treat revision/hash failures as setup gates, not behavioral RED; preserve `plans/checkpoints/bold-reef-6539.red-green-proof.md` as the genuine historical `400 SCHEMA_INVALID` RED.
- Generate owner mirrors from the pinned contract and fixtures; never combine old and new fields into a locally invented schema.
- Durable invocation evidence must exist before provider I/O; process-local retry suppression cannot provide restart safety.
- Named leaf results, not aggregate reporter totals, establish the acceptance matrix.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Implementation

1. Before any code/test edit, require `git -C /Users/michal/.openclaw rev-parse HEAD` = `79bbc5c0426bc7be901d5199da11b21213bfa008`, empty scoped status, and SHA-256 values `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b` for `contracts/deliberation-v2/v1/contract.json`, `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4` for `fixtures.json`, `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528` for `lib/deliberation_wire.py`, and `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca` for `lib/deliberation_spool_contracts.py`. Print the full verified values from the integration command. Stop without product edits while `HEAD` differs; the operator, not this task, must restore the approved checkout.
2. Invoke `skill:tdd`. Link the historical RED into `plans/checkpoints/cool-mist-4658.red-green-proof.md`, add the OR-19 client regression and named owner-runtime leaves before production changes, then capture fresh GREEN against the exact supplied KM root.
3. Regenerate `extensions/deliberation/contracts/km-wire-v1.json` and `cutover-controls-v1.json` from the pinned owner contract and fixtures. Update `provenance.json` with the full revision, all four owner hashes, regenerated local hashes, and repository-only/live-not-tested scope. Keep `openclaw-overlay-v1.json` separate unless the pinned owner explicitly changes an OpenClaw-owned projection.
4. Reconcile `extensions/deliberation/src/km-client.ts` to the pinned closed schemas. Validate attempt ordinal/identity ordering and each attempt's immutable record, pipeline, source, target, candidate, envelope/digest, invocation, terminal reason, and receipt/failure evidence. Reject a later attempt after invoked-unknown or legacy `NOT_SENT`/`DELIVERY_UNKNOWN`; authorize a fresh identity only after proven never-invoked `RESERVATION_ABANDONED`.
5. Reconcile the producer/probe boundary so one authenticated event yields one durable record and exact replay yields no mutation. Build source history only as separate context; use KM public spool APIs and exact-one projections without advancing debounce or interpreting a message collection as grouping authority.
6. Change `extensions/deliberation/src/final-adapter.ts` only if pinned tests expose drift: reserve without target override, persist invocation before one provider call, complete `SENT` with the exact immutable receipt, complete only permission/rejection/rate-limit failures, and leave timeout/transport/invalid-receipt outcomes unresolved for owner reconciliation.
7. Replace aggregate/burst assertions in `extensions/deliberation/scripts/km-listener.cross-repo.ts` with exactly named leaves: `OR-07 authenticated-event-creates-one-record`, `OR-08 duplicate-idempotent-conflict-zero-mutation`, `OR-09 account-channel-source-isolation`, `OR-10 history-context-only-pending-event-singular`, `OR-11 pipeline-source-target-immutable-end-to-end`, `OR-12 reservation-no-target-override-cas-replay`, `OR-13 invocation-marker-before-one-provider-call`, `OR-14 sent-completion-exact-immutable-receipt`, `OR-15 authoritative-provider-rejection-terminal`, `OR-16 timeout-transport-remain-delivery-unknown`, `OR-17 invoked-unknown-nonreservable-after-restart`, `OR-18 never-invoked-abandonment-fresh-attempt-id`, `OR-19 legacy-not-sent-unknown-never-authorize-retry`, `OR-20 historical-attempt-drift-and-tamper-fail-closed`, and `OR-21 atomic-bounded-legacy-migration-audit-only`.
8. Keep authentication/protocol negatives, production-spool rejection, random loopback ports, temporary credentials/SQLite, no-live-path checks, listener shutdown, and recursive cleanup as supporting tests outside OR counts. Fail the command for a missing, duplicate, skipped, or misnamed OR leaf.
9. Run the three unchanged pinned-KM E2E selectors and repair only OpenClaw producer/client/adapter defects they expose: `test_real_producer_listener_to_ready_to_send_is_deterministic_and_audited`, `test_composed_send_uses_real_public_plugin_adapter_once_and_persists_fake_receipt`, and `test_public_plugin_adapter_rejects_target_mismatch_without_fake_send`.
10. Update plugin/docs wording only if executable semantics or command output changed. Do not edit KM, build/link/install, touch production spool, restart services/Gateway, send through a live provider, deploy, or activate a pilot.
11. Record the verified bundle, touched boundaries, each OR result, mandatory gate, three E2E results, focused checks, and historical RED/fresh GREEN in the task proof and final note. Run `skill:validate-implementation`, fresh `skill:autoreview`, resolve findings, rerun affected proof, then invoke `skill:save-learning` last.

## Files to Modify

| File                                                                                 | Change                                                                                       |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,provenance}.json` | Regenerate exact owner mirrors and immutable provenance.                                     |
| `extensions/deliberation/src/contract.test.ts`                                       | Assert supplied revision/hashes, generated mirrors, and closed singular/lifecycle semantics. |
| `extensions/deliberation/src/km-client.ts`                                           | Enforce immutable historical-attempt evidence and retry fencing.                             |
| `extensions/deliberation/src/km-client.test.ts`                                      | Replace permissive retained-outcome cases with OR-19/OR-20 regressions.                      |
| `extensions/deliberation/scripts/km-spool-probe.py`                                  | Prepare/read singular records and isolated migration state through owner APIs.               |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                          | Add exact authority preflight/output and named OR-07..OR-21 leaves.                          |
| `extensions/deliberation/scripts/{intake-producer.ts,intake-producer.test.ts}`       | Conditional owner-schema reconciliation while preserving one call per event.                 |
| `extensions/deliberation/src/{final-adapter.ts,final-adapter.test.ts}`               | Conditional owner-demonstrated adapter reconciliation.                                       |
| `extensions/deliberation/README.md`, `docs/plugins/reference/deliberation.md`        | Conditional operator-visible updates only.                                                   |
| `plans/checkpoints/cool-mist-4658.red-green-proof.md`                                | Historical RED link plus fresh owner-backed GREEN evidence.                                  |

## TDD

Implement the TDD cycle per `skill:tdd` and write evidence to `plans/checkpoints/cool-mist-4658.red-green-proof.md`.

**Primary test file:** `extensions/deliberation/src/km-client.test.ts`  
**Run command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t "OR-19"`  
**Edit hint:** replace the permissive retained-outcome case near the existing historical-attempt tests.

```ts
import { describe, expect, it, vi } from "vitest";
import { createKmClient } from "./km-client.js";

it.each(["NOT_SENT", "DELIVERY_UNKNOWN"] as const)(
  "OR-19 legacy-not-sent-unknown-never-authorize-retry: %s",
  async (outcome) => {
    const legacyAttempt = {
      ...validTerminalAttempt(),
      attemptId: `legacy-${outcome}`,
      completionOutcome: outcome,
      outcome,
      terminalReason: outcome === "DELIVERY_UNKNOWN" ? "delivery_outcome_unknown" : null,
    };
    const laterAttempt = { ...validTerminalAttempt(), ordinal: 2 };
    const reservation = { ...validReservation(), ordinal: 2 };
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [legacyAttempt, laterAttempt] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation,
        attemptedTarget: reservation.deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "SENT",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).rejects.toThrow("legacy delivery outcome cannot authorize a later attempt");
  },
);
```

| Test                                       | RED                                                                         | GREEN                                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| OR-19 legacy outcome followed by attempt 2 | Current parser accepts the response.                                        | Client rejects the unauthorized later attempt.                                                   |
| OR-07..OR-12 intake/reservation leaves     | Stale mirrors/probe or unnamed aggregate assertions fail owner composition. | Singular intake, idempotency, isolation, immutable identity, and no-target-override leaves pass. |
| OR-13..OR-21 lifecycle leaves              | Missing named restart, ambiguity, migration, or tamper proof fails.         | Every exact owner leaf is printed once and passes.                                               |

## Verification

1. Mandatory owner gate: `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`; require printed exact revision/four hashes and OR-07..OR-21 Green exactly once.
2. Focused OpenClaw: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`.
3. Plugin regression: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose`.
4. Isolated KM E2E from the approved KM root: `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/pytest tests/integration/test_deliberation_v2_e2e.py -q -k 'test_real_producer_listener_to_ready_to_send_is_deterministic_and_audited or test_composed_send_uses_real_public_plugin_adapter_once_and_persists_fake_receipt or test_public_plugin_adapter_rejects_target_mismatch_without_fake_send'`.
5. Use `skill:openclaw-testing` for touched-file Oxlint/oxfmt, test typechecking, changed lanes/gate, and build if published/lazy boundaries changed; finish with `git diff --check` and `git diff --numstat`.

## Dependencies

- `/Users/michal/.openclaw` must report exact `HEAD` `79bbc5c0426bc7be901d5199da11b21213bfa008` without this task changing KM Git metadata; the four approved files must remain clean and hash-identical.
- KM tests must use random loopback, temporary credentials, temporary SQLite, and cleanup only.
- Preserve unrelated dirty-worktree changes and edit only task-owned hunks.

---

_Status: DRAFT_
