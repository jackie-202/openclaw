# Plan 2026-08-23: Complete immutable KM owner convergence

Implement only the convergence and proof omitted after the parent task stopped at its authority gate.

_Status: DRAFT_
_Created: 2026-08-23_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/src/km-client.ts:412` permits legacy retained attempts without complete immutable evidence; `extensions/deliberation/src/km-client.test.ts:1544` explicitly accepts a later attempt after `NOT_SENT` or `DELIVERY_UNKNOWN`.
- `extensions/deliberation/scripts/km-spool-probe.py:53` closes a burst-era record from `debounceUntil` and derives history from `record.messages`; `extensions/deliberation/scripts/km-listener.cross-repo.ts:476` reports aggregate tests rather than exact `OR-07` through `OR-21` leaves.
- `extensions/deliberation/contracts/provenance.json:1` and `extensions/deliberation/src/contract.test.ts:605` still pin repository-local `calm-cove-1824` evidence, not the supplied immutable owner bundle.
- `extensions/deliberation/src/final-adapter.ts:103` already enforces reserve -> invoke -> one provider call -> completion, exact durable targets, definitive rejection completion, and unresolved ambiguous outcomes. Change it only if the approved owner composition demonstrates drift.
- The parent task made no production or test edits. Preserve all unrelated dirty worktree changes and limit implementation to task-owned hunks.

### Relevant Documentation

- `plans/tasks/2026-08-23_converge-openclaw-with-supplied-immutable-km-deliberation-ow.md` defines the immutable revision/hashes, exact deliverables, owner-backed command, and no-KM-write boundary.
- `docs/plugins/reference/deliberation.md:97` documents the current six-operation wire and lifecycle guarantees; update only if executable user-visible semantics change.
- `docs/reference/test.md:11` requires focused tests before broader plugin/changed-surface proof. No relevant PlantUML diagrams exist.

### Knowledge Base

- Verify the exact owner revision, clean scoped paths, and all four hashes before behavioral edits; setup/provenance failure is not RED (`learnings/tooling/immutable-owner-gate-before-behavioral-tdd.md`).
- Preserve the genuine lineage RED and append GREEN only after the identical owner-backed boundary passes (`learnings/patterns/calm-fork-2914-preserve-honest-red-green-provenance-when-blocked.md`, `learnings/tooling/2026-08-21_acceptance-green-must-match-historical-red-command.md`).
- External authority defines the wire contract; keep OpenClaw provider projection in the plugin adapter rather than inventing fields in the owner mirror.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: preserve historical RED and capture fresh task-scoped GREEN.
- `task-evidence`: recover exact parent proof metadata if the linked artifact is insufficient.
- `openclaw-testing`: select focused plugin and changed-surface checks.
- `validate-implementation`: check plugin/owner boundaries after implementation.
- `autoreview`: mandatory fresh pre-handoff review.
- `save-learning`: mandatory final implementation action.

## Implementation

1. Require `/Users/michal/.openclaw` at revision `79bbc5c0426bc7be901d5199da11b21213bfa008`, empty scoped status, and these exact hashes before any code/test edit: contract `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`, fixtures `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`, `lib/deliberation_wire.py` `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`, and `lib/deliberation_spool_contracts.py` `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`. The current revision is `4fce12d2523969ea5e13e028f11a9aff6175591f`; an operator must restore it without this task changing KM.
2. Invoke `skill:tdd`. Create `plans/checkpoints/dark-crag-5569.red-green-proof.md`, link the genuine owner-boundary RED in `plans/checkpoints/calm-fork-2914.red-green-proof.md`, and add the OR-19/OR-20 regressions before production edits. Do not rerun old code to manufacture another RED.
3. Regenerate `km-wire-v1.json` and `cutover-controls-v1.json` from the approved contract/fixtures. Replace repository-local provenance with the full owner revision, four owner hashes, generated local hashes, and explicit repository-only/live-not-tested scope. Keep OpenClaw `mode` projection in `openclaw-overlay-v1.json` and the adapter, not the owner mirror.
4. Reconcile `km-client.ts` to serialize and parse only approved owner fields, then perform provider-specific target conversion at the OpenClaw boundary. Validate ordered unique attempt ordinals/identities and immutable record, pipeline, source, target, candidate, envelope/digest, invocation, terminal reason, and receipt/failure evidence. Permit a later attempt only after proven never-invoked `RESERVATION_ABANDONED`; reject later attempts after invoked-unknown and legacy `NOT_SENT`/`DELIVERY_UNKNOWN`.
5. Replace `km-spool-probe.py` burst preparation with one singular admitted record through KM public spool APIs. Supply history separately as context; preserve temporary SQLite, random loopback, production-spool rejection, sentinel checks, and cleanup.
6. Split `km-listener.cross-repo.ts` into leaves printed exactly once: `OR-07 authenticated-event-creates-one-record`, `OR-08 duplicate-idempotent-conflict-zero-mutation`, `OR-09 account-channel-source-isolation`, `OR-10 history-context-only-pending-event-singular`, `OR-11 pipeline-source-target-immutable-end-to-end`, `OR-12 reservation-no-target-override-cas-replay`, `OR-13 invocation-marker-before-one-provider-call`, `OR-14 sent-completion-exact-immutable-receipt`, `OR-15 authoritative-provider-rejection-terminal`, `OR-16 timeout-transport-remain-delivery-unknown`, `OR-17 invoked-unknown-nonreservable-after-restart`, `OR-18 never-invoked-abandonment-fresh-attempt-id`, `OR-19 legacy-not-sent-unknown-never-authorize-retry`, `OR-20 historical-attempt-drift-and-tamper-fail-closed`, and `OR-21 atomic-bounded-legacy-migration-audit-only`. Fail on missing, duplicate, skipped, or renamed leaves; keep protocol/isolation/cleanup guards outside the count.
7. Run the three approved KM E2E selectors. Change `intake-producer.ts` or `final-adapter.ts` only for a demonstrated approved-owner failure; preserve one intake call and reserve -> invoke -> one provider call -> exact completion.
8. Update plugin docs only if executable commands or user-visible semantics change. Do not edit KM, access production spool, deploy, restart services/Gateway, build/link/install, send through a live provider, or activate a pilot.
9. Append fresh GREEN and focused verification to the `dark-crag-5569` proof/checkpoint, run `skill:validate-implementation`, complete fresh `skill:autoreview` until no actionable findings remain, then invoke `skill:save-learning` as the final implementation action and save at least one learning.

## Files to Modify

| File                                                                                 | Change                                                            |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,provenance}.json` | Mirror the approved owner bundle and record immutable provenance. |
| `extensions/deliberation/src/{contract.test.ts,km-client.ts,km-client.test.ts}`      | Pin owner artifacts and enforce historical-attempt/retry fencing. |
| `extensions/deliberation/scripts/{km-spool-probe.py,km-listener.cross-repo.ts}`      | Use singular owner APIs and exact OR-07..OR-21 leaves.            |
| `extensions/deliberation/scripts/{intake-producer.ts,intake-producer.test.ts}`       | Modify only for approved-owner composition failures.              |
| `extensions/deliberation/src/{final-adapter.ts,final-adapter.test.ts}`               | Modify only for approved-owner lifecycle failures.                |
| `extensions/deliberation/README.md`, `docs/plugins/reference/deliberation.md`        | Update only for changed public behavior or commands.              |
| `plans/checkpoints/{dark-crag-5569.red-green-proof.md,dark-crag-5569.checkpoint.md}` | Link historical RED and record fresh GREEN/completion evidence.   |

## TDD

Implement the cycle with `skill:tdd`; the targeted unit RED supplements but does not replace the historical owner-boundary RED.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Run command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t "OR-19"`  
**Edit hint:** replace the permissive retained-outcome case at `extensions/deliberation/src/km-client.test.ts:1544`; reuse the file's existing imports and helpers.

```ts
// Existing real imports used by this test:
// import { describe, expect, it, vi } from "vitest";
// import { createKmClient } from "./km-client.js";
it.each(["NOT_SENT", "DELIVERY_UNKNOWN"] as const)(
  "OR-19 legacy-not-sent-unknown-never-authorize-retry: %s",
  async (outcome) => {
    const legacyAttempt = {
      ordinal: 1,
      attemptId: `legacy-${outcome}`,
      completionOutcome: outcome,
      outcome,
      providerAttemptId: null,
      providerReceiptId: null,
      providerMessageId: null,
      proofReference: null,
      completedAt: null,
      deliveryEnvelope: null,
      deliveryEnvelopeDigest: null,
      reserveIdempotencyKey: `reserve:legacy-${outcome}`,
      terminalReason: outcome === "DELIVERY_UNKNOWN" ? "delivery_outcome_unknown" : null,
    };
    const reservation = { ...validReservation(), ordinal: 2 };
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [legacyAttempt, { ...validTerminalAttempt(), ordinal: 2 }] },
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

| Test                                       | RED                                                                                  | GREEN                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| OR-19 legacy outcome followed by ordinal 2 | Current parser resolves completion.                                                  | Client rejects the unauthorized later attempt.           |
| OR-20 reordered/tampered history           | Current parser accepts incomplete cross-attempt drift.                               | Every historical attempt is ordered and immutably bound. |
| OR-07..OR-21 owner leaves                  | Current mirrors/probe and aggregate harness do not satisfy the approved composition. | Every exact leaf appears once and passes.                |

## Verification

1. `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`; require printed revision/four hashes and each OR-07..OR-21 leaf once.
2. `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`.
3. `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose`.
4. From the approved KM root: `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/pytest tests/integration/test_deliberation_v2_e2e.py -q -k 'test_real_producer_listener_to_ready_to_send_is_deterministic_and_audited or test_composed_send_uses_real_public_plugin_adapter_once_and_persists_fake_receipt or test_public_plugin_adapter_rejects_target_mismatch_without_fake_send'`.
5. Use `skill:openclaw-testing` for touched-file format/lint, test types, and changed lanes; finish with `git diff --check` and `git diff --numstat`.

## Dependencies

- Operator-restored `/Users/michal/.openclaw` at exact revision `79bbc5c0426bc7be901d5199da11b21213bfa008`; current revision `4fce12d2523969ea5e13e028f11a9aff6175591f` blocks implementation even though all four scoped files are clean and hash-identical.
- The owner checkout remains read-only and all execution uses isolated temporary state.
- Preserve unrelated worktree changes and edit only task-owned hunks.
