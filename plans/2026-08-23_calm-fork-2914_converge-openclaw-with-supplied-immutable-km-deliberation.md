# Plan 2026-08-23: Converge OpenClaw With Immutable KM Deliberation Bundle

_Status: DRAFT_

## Analysis

### Codebase Context

- The preserved worktree already has singular intake, immutable admission routing, no reservation target override, invocation-before-send, one provider call, exact receipt completion, and unresolved ambiguous delivery paths. Do not rewrite them unless pinned owner tests fail.
- Remaining defects are stale owner mirrors/provenance, permissive retained-attempt parsing and cross-attempt retry authorization, burst-era probe preparation, aggregate integration tests, and absent acceptance proof.
- Current authority files match all four supplied hashes, but `/Users/michal/.openclaw` reports revision `09c34cad5409f89fb68c3038c84456b144612c21`; implementation must stop until the operator restores `79bbc5c0426bc7be901d5199da11b21213bfa008`.
- `extensions/deliberation/src/km-client.ts:503` exempts retained outcomes from complete immutable evidence, while `extensions/deliberation/src/km-client.test.ts:1544` currently authorizes a later attempt after legacy outcomes.
- `extensions/deliberation/scripts/km-spool-probe.py:53` still closes from `debounceUntil` and derives history from the record message array; `extensions/deliberation/scripts/km-listener.cross-repo.ts:476` reports aggregate tests and checks only provenance-listed hashes.
- The pinned owner contract has no OpenClaw `mode` field, exact-one `messages`, audit-only legacy outcomes, and definitive failure classes only. Keep provider-specific target semantics in the OpenClaw overlay/adapter instead of copying them into the owner mirror.

### Relevant Documentation

- `docs/plugins/reference/deliberation.md` describes singular intake, immutable routing, invocation-before-send, and unresolved ambiguous outcomes; update only if the final executable behavior changes.
- `docs/reference/test.md` requires focused plugin tests before broader changed-surface checks.
- Pinned owner sources inspected directly: `workspace/km-system/contracts/deliberation-v2/v1/{contract,fixtures}.json`, `lib/deliberation_spool_validation.py`, and `tests/{integration/test_deliberation_v2_e2e.py,test_deliberation_spool_characterization.py}` at `79bbc5c0426bc7be901d5199da11b21213bfa008`.

### Knowledge Base

- External contract provenance is a precondition, not behavioral RED; never manufacture RED from a revision/hash failure.
- Mirror the owner contract exactly and isolate OpenClaw-owned projections at the adapter boundary.
- Historical GREEN must use the same owner-backed boundary as the genuine lineage RED; reporter totals do not replace named leaf results.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; the returned external-authority learnings reinforce contract-first gating.

## Available Skills

- `tdd`: preserve the lineage RED and capture same-boundary GREEN.
- `task-evidence`: locate exact historical RED command/output without recreating it.
- `openclaw-testing`: choose focused plugin and changed-surface checks.
- `validate-implementation`: verify owner/plugin boundaries after implementation.
- `autoreview`: complete mandatory fresh pre-handoff review.
- `save-learning`: save at least one learning as the final implementation action.

## Implementation

1. Before any code or test edit, require `/Users/michal/.openclaw` HEAD `79bbc5c0426bc7be901d5199da11b21213bfa008`, clean status for the four supplied files, and the four supplied SHA-256 values. Print the verified revision and hashes from the integration preflight. Stop for operator repair if any value differs; do not alter KM or its Git metadata.
2. Invoke `skill:tdd`. Create `plans/checkpoints/calm-fork-2914.red-green-proof.md`, link the genuine `400 SCHEMA_INVALID` RED from `plans/checkpoints/bold-reef-6539.red-green-proof.md`, and add the OR-19/OR-20 tests before production edits. Do not rerun old code to fabricate historical RED.
3. Generate `extensions/deliberation/contracts/km-wire-v1.json` and `cutover-controls-v1.json` from the pinned owner contract and fixtures. Update `provenance.json` with the full revision, all four owner hashes, generated local hashes, and repository-only/live-not-tested scope. Keep provider-specific `mode` semantics in `openclaw-overlay-v1.json`; do not merge them into the owner mirror.
4. Reconcile the KM boundary in `km-client.ts`: serialize/parse only pinned owner fields, then adapt provider-specific target semantics explicitly at the OpenClaw boundary. Validate ordered unique ordinals/identities and every attempt's record, pipeline, source, target, candidate, envelope/digest, invocation, terminal reason, and receipt/failure evidence. Permit a later identity only after proven never-invoked `RESERVATION_ABANDONED`; reject later attempts after invoked-unknown or legacy `NOT_SENT`/`DELIVERY_UNKNOWN`.
5. Replace burst-era probe setup with one singular admitted record through KM public spool APIs. Treat exact-one `messages` and `debounceUntil` as compatibility projections only; source history remains separately supplied context. Preserve temporary SQLite, random loopback, production-spool rejection, and cleanup.
6. Split the cross-repository harness into exact leaves printed once: `OR-07 authenticated-event-creates-one-record`, `OR-08 duplicate-idempotent-conflict-zero-mutation`, `OR-09 account-channel-source-isolation`, `OR-10 history-context-only-pending-event-singular`, `OR-11 pipeline-source-target-immutable-end-to-end`, `OR-12 reservation-no-target-override-cas-replay`, `OR-13 invocation-marker-before-one-provider-call`, `OR-14 sent-completion-exact-immutable-receipt`, `OR-15 authoritative-provider-rejection-terminal`, `OR-16 timeout-transport-remain-delivery-unknown`, `OR-17 invoked-unknown-nonreservable-after-restart`, `OR-18 never-invoked-abandonment-fresh-attempt-id`, `OR-19 legacy-not-sent-unknown-never-authorize-retry`, `OR-20 historical-attempt-drift-and-tamper-fail-closed`, and `OR-21 atomic-bounded-legacy-migration-audit-only`. Fail on missing, duplicate, skipped, or renamed leaves; keep auth/protocol and cleanup guards outside the OR count.
7. Run the three pinned KM E2E selectors. Change `intake-producer.ts` or `final-adapter.ts` only for a demonstrated pinned-owner failure; preserve one intake call, reserve -> invoke -> one provider call -> completion, exact receipt binding, definitive failures only, and unresolved ambiguous outcomes.
8. Update plugin docs only if executable commands or semantics changed. Do not build/link/install, deploy, restart services/Gateway, touch production spool, send through a live provider, or activate a pilot.
9. Capture fresh GREEN and all verification output in the follow-up proof/checkpoint. Run `skill:validate-implementation`, fresh `skill:autoreview`, resolve findings, rerun affected proof, prepare the final evidence summary, then invoke `skill:save-learning` as the last implementation action and save at least one learning.

## Files to Modify

| File                                                                                 | Change                                                                |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,provenance}.json` | Generate exact owner mirrors and immutable provenance.                |
| `extensions/deliberation/src/{contract.test.ts,km-client.ts,km-client.test.ts}`      | Pin the supplied bundle and enforce historical-attempt/retry fencing. |
| `extensions/deliberation/scripts/{km-spool-probe.py,km-listener.cross-repo.ts}`      | Use singular owner APIs, exact preflight, and OR-07..OR-21 leaves.    |
| `extensions/deliberation/scripts/{intake-producer.ts,intake-producer.test.ts}`       | Modify only if pinned composition exposes producer drift.             |
| `extensions/deliberation/src/{final-adapter.ts,final-adapter.test.ts}`               | Modify only if pinned composition exposes adapter drift.              |
| `extensions/deliberation/README.md`, `docs/plugins/reference/deliberation.md`        | Update only for changed user-visible behavior.                        |
| `plans/checkpoints/{calm-fork-2914.red-green-proof.md,calm-fork-2914.checkpoint.md}` | Record lineage RED, fresh GREEN, and completion evidence.             |

## TDD

Implement the TDD cycle per `skill:tdd`.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Run command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t "OR-19"`  
**Edit hint:** replace the permissive retained-outcome case at `extensions/deliberation/src/km-client.test.ts:1544`; existing imports and helpers are sufficient.

```ts
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
        delivery: {
          attempts: [legacyAttempt, { ...validTerminalAttempt(), ordinal: 2 }],
        },
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

| Test                                         | RED                                                                        | GREEN                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| OR-19 legacy outcome followed by ordinal 2   | Current parser resolves the completion response.                           | Client rejects the unauthorized later attempt.                       |
| OR-20 reordered/tampered historical attempts | Current parser accepts incomplete or cross-attempt drift.                  | Every historical attempt is ordered and immutably bound.             |
| OR-07..OR-21 owner leaves                    | Current hybrid mirror/probe and aggregate harness fail pinned composition. | Every exact leaf appears once and passes against the supplied owner. |

## Verification

1. `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`; require the exact revision/four hashes and OR-07..OR-21 once each.
2. `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`.
3. `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose`.
4. From the approved KM root, run `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/pytest tests/integration/test_deliberation_v2_e2e.py -q -k 'test_real_producer_listener_to_ready_to_send_is_deterministic_and_audited or test_composed_send_uses_real_public_plugin_adapter_once_and_persists_fake_receipt or test_public_plugin_adapter_rejects_target_mismatch_without_fake_send'`.
5. Use `skill:openclaw-testing` for touched-file formatting/lint, test typechecking, changed lanes, and build only if published/lazy boundaries changed; finish with `git diff --check` and `git diff --numstat`.

## Dependencies

- Operator-restored `/Users/michal/.openclaw` at exact revision `79bbc5c0426bc7be901d5199da11b21213bfa008`; current revision `09c34cad5409f89fb68c3038c84456b144612c21` is blocking despite matching artifact hashes.
- Four scoped KM files remain clean and hash-identical; all owner execution uses isolated temporary state.
- Preserve unrelated worktree changes and edit only task-owned hunks.
