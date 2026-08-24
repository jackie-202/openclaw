# Plan 2026-08-24: Complete OpenClaw convergence against verified KM owner artifacts

## Analysis

### Relevant documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:151` limits this task to owner convergence and defines artifact hashes, not KM HEAD, as semantic authority.
- `docs/reference/test.md:11` requires narrow touched-surface proof before broader gates.
- `plans/checkpoints/wild-crag-3236.evidence.md:18` preserves the historical KM results: 28 focused passes, 26 characterization passes, and composed E2E `3 failed, 38 passed`; its command lines are truncated.
- Prior task plans recover the unchanged composed selectors: `test_real_producer_listener_to_ready_to_send_is_deterministic_and_audited`, `test_composed_send_uses_real_public_plugin_adapter_once_and_persists_fake_receipt`, and `test_public_plugin_adapter_rejects_target_mismatch_without_fake_send`.

### Codebase boundaries

- `extensions/deliberation/src/intake.ts` already marks configured events `aggregation: "separate"` and sends one intake per admitted event with source history registered separately.
- `extensions/deliberation/scripts/intake-producer.ts` drives the real route/admission/client path; its tests cover separate Slack event IDs and source-default targets.
- `extensions/deliberation/src/km-client.ts` owns closed response parsing and lifecycle requests. Reservation serialization omits a target override, but retained `NOT_SENT`/`DELIVERY_UNKNOWN` attempts currently permit a later ordinal and historical validation is weaker than the required immutable-envelope/receipt checks.
- `extensions/deliberation/src/final-adapter.ts` persists invocation before one provider call and terminalizes only typed permission/rejection/rate-limit failures; ambiguous outcomes remain uncompleted. Its APIs still accept duplicate caller-supplied attempted targets instead of deriving all evidence from the reservation envelope.
- `extensions/deliberation/scripts/km-spool-probe.py` still advances `debounceUntil`, closes a burst, and builds source context from `record.messages`; replace these stale assumptions with the owner’s singular-record public APIs.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` hard-fails on KM HEAD and defines OR-07..OR-21 as wrappers around spawned owner pytest selectors. Keep its loopback/random credential/temp SQLite/production-spool/cleanup guards, but make each OR leaf execute the producer/client/adapter against the isolated listener.
- `extensions/deliberation/contracts/km-wire-v1.json` still declares `burstPolicy`, reservation `deliveryTarget`, `messages`, `debounceUntil`, and related burst fields; regenerate/reconcile mirrors from the accepted owner contract and fixtures rather than patching a hybrid.
- `extensions/deliberation/src/contract.test.ts`, `km-client.test.ts`, `final-adapter.test.ts`, and `scripts/intake-producer.test.ts` are the focused regression owners.

### Owner contract evidence

- Accepted SHA-256 bundle: contract `5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b`; fixtures `f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4`; wire `a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528`; spool contracts `47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca`.
- `extensions/deliberation/contracts/provenance.json` records those hashes but incorrectly treats revision `79bbc5c...` as immutable authority.
- Direct KM read was blocked by this planning session’s external-directory permission. Implementation must print current HEAD and verify all four files before any product edit; continue on matching hashes regardless of HEAD or unrelated dirt, and stop naming the exact mismatched file otherwise.

### Knowledge base

- External owner artifacts define the wire; acceptance work and repository-local mirrors do not grant authority.
- Contract preflight precedes behavioral TDD. A hash/revision setup failure is not a behavioral RED.
- Preserve the genuine historical RED rather than rerunning old code to manufacture one; require fresh owner-backed GREEN.
- Trace the sole sender activation path and canonical reservation rather than accepting literal/schema-only proof.
- `/deliberation/v1/*` and `km-wire-v1.json` are current protocol-version names, not v1 product residue.
- Extension production changes remain inside the plugin and use only public Plugin SDK seams.

## Available Skills

- `tdd`: create focused failing lifecycle tests first and preserve RED/GREEN proof.
- `openclaw-testing`: choose focused plugin tests, then the owner-backed integration and deterministic KM E2E.
- `task-evidence`: preserve exact historical commands/results and explicitly retain truncated-log gaps.
- `validate-implementation`: check the final implementation against project and proposal constraints.
- `autoreview`: mandatory fresh pre-handoff review for non-trivial code changes.
- `save-learning`: mandatory final action after implementation and evidence are complete.

## Implementation

1. Run the four-file authority preflight before edits: print `git -C "$OPENCLAW_DELIBERATION_KM_ROOT" rev-parse HEAD`, SHA-256 each required relative path, compare to the accepted constants, and continue independently of HEAD/other dirt. On mismatch, write the exact path/expected/actual hash to the proof and stop without changing product files.
2. Rebuild the OpenClaw mirror from the verified owner `contract.json` and `fixtures.json`: remove burst/debounce and reservation target-override residue, retain the owner’s exact singular record, envelope, invocation, completion, historical-attempt, and error schemas, then update `provenance.json` to identify the four hashes as authority and HEAD as runtime-only provenance. Make contract tests reject a hybrid mirror.
3. Apply `skill:tdd`; create `plans/checkpoints/cool-vale-4616.red-green-proof.md`, link the genuine historical `wild-crag-3236` E2E RED and its truncated-log limitation, add OR-19/OR-20 focused regressions, run them RED, then implement.
4. Make producer/probe setup singular: retain `intake.ts` separate/exclusive event policy and one intake call, update producer tests to prove two same-window authenticated events create distinct durable identities, and replace `km-spool-probe.py` use of `debounceUntil`, `close_due`, and grouped `messages` with the verified owner’s one-record lifecycle APIs. Source history remains a separate context snapshot only.
5. Converge `km-client.ts` to the owner contract: reserve only the admitted immutable envelope; derive invocation/completion target from that envelope; parse attempts in strict ordinal order; validate every attempt’s record/pipeline/source/target/envelope digest, invocation identity, terminal reason, and receipt/failure evidence; reject later attempts after any invoked/unknown or legacy `NOT_SENT`/`DELIVERY_UNKNOWN` outcome unless the owner response contains the explicit authorized transition; allow a new attempt ID only after a never-invoked abandonment.
6. Narrow `final-adapter.ts` so callers cannot supply an alternate attempted target. Persist the invocation marker before exactly one provider call; complete `FAILED` only for typed permission/rejection/rate-limit results; leave timeout, transport, malformed receipt, and completion ambiguity invoked/uncompleted for owner reconciliation; never loop or send again after invocation.
7. Rewrite `km-listener.cross-repo.ts` preflight and scenarios. Print current KM HEAD without comparing it to an accepted revision, verify exactly the four hashes, keep random loopback/temporary `0600` credential/temporary SQLite/production-spool exclusion/final cleanup, and make each exact OR leaf exercise OpenClaw producer/client/adapter calls against the isolated owner listener instead of spawning a preselected pytest as a synthetic substitute:
   - `OR-07 authenticated-event-creates-one-record`
   - `OR-08 duplicate-idempotent-conflict-zero-mutation`
   - `OR-09 account-channel-source-isolation`
   - `OR-10 history-context-only-pending-event-singular`
   - `OR-11 pipeline-source-target-immutable-end-to-end`
   - `OR-12 reservation-no-target-override-cas-replay`
   - `OR-13 invocation-marker-before-one-provider-call`
   - `OR-14 sent-completion-exact-immutable-receipt`
   - `OR-15 authoritative-provider-rejection-terminal`
   - `OR-16 timeout-transport-remain-delivery-unknown`
   - `OR-17 invoked-unknown-nonreservable-after-restart`
   - `OR-18 never-invoked-abandonment-fresh-attempt-id`
   - `OR-19 legacy-not-sent-unknown-never-authorize-retry`
   - `OR-20 historical-attempt-drift-and-tamper-fail-closed`
   - `OR-21 atomic-bounded-legacy-migration-audit-only`
8. Run the unchanged three KM composed selectors against isolated state. Repair only serialization, parsing, or adapter behavior at the OpenClaw boundary; do not edit KM tests/assertions. Append fresh commands, exit codes, per-leaf results, HEAD/hashes, cleanup proof, and GREEN evidence to the checkpoint.
9. Run focused tests and changed checks, inspect `git diff --numstat` for avoidable production growth, invoke `validate-implementation`, then fresh `autoreview` until no actionable findings remain. The completion note must list every required evidence item and explicitly confirm no forbidden KM/live/deployment action occurred; invoke `save-learning` last.

## Files to Modify

| Path                                                                                                 | Change                                                                      |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/km-wire-v1.json`                                                  | Exact owner wire mirror; remove burst/hybrid fields.                        |
| `extensions/deliberation/contracts/provenance.json`                                                  | Hash-authority provenance; no static HEAD gate.                             |
| `extensions/deliberation/contracts/cutover-controls-v1.json` and other owner-derived fixture mirrors | Regenerate only where the verified owner fixtures differ.                   |
| `extensions/deliberation/src/km-client.ts`                                                           | Immutable request derivation and complete historical-attempt validation.    |
| `extensions/deliberation/src/final-adapter.ts`                                                       | One invocation/one send and definitive-versus-ambiguous outcome fencing.    |
| `extensions/deliberation/scripts/intake-producer.ts`                                                 | Adjust only if exact owner intake serialization differs.                    |
| `extensions/deliberation/scripts/km-spool-probe.py`                                                  | Singular owner lifecycle setup; no debounce/group authority.                |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                                          | Hash preflight and real OR-07..OR-21 isolated scenarios.                    |
| `extensions/deliberation/src/{contract,km-client,final-adapter}.test.ts`                             | Closed-contract, retry-fencing, tamper, receipt, and ambiguity regressions. |
| `extensions/deliberation/scripts/intake-producer.test.ts`                                            | One record per authenticated provider event.                                |
| `plans/checkpoints/cool-vale-4616.red-green-proof.md`                                                | Exact historical RED and fresh GREEN evidence.                              |

## TDD

Implement the TDD cycle with `skill:tdd`; record evidence in `plans/checkpoints/cool-vale-4616.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Run command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t "OR-19|OR-20" -- --reporter=verbose`  
**Edit hint:** append inside `describe("KM contract parsing")`, reusing the file’s real `createClient`, `validReservation`, `validTerminalAttempt`, and Vitest imports.

```ts
it("OR-19 legacy-not-sent-unknown-never-authorize-retry", async () => {
  const legacy = {
    ordinal: 1,
    attemptId: "legacy-unknown",
    completionOutcome: "DELIVERY_UNKNOWN",
    outcome: "DELIVERY_UNKNOWN",
    providerAttemptId: "provider-legacy",
    providerReceiptId: null,
    providerMessageId: null,
    proofReference: null,
    completedAt: null,
    deliveryEnvelope: null,
    deliveryEnvelopeDigest: null,
    reserveIdempotencyKey: "reserve:legacy",
    terminalReason: "delivery_outcome_unknown",
  };
  const current = { ...validTerminalAttempt(), ordinal: 2 };
  const client = createClient({
    protocolVersion: 1,
    record: {
      recordId: "record-1",
      state: "SENT",
      version: 9,
      delivery: { attempts: [legacy, current] },
    },
  });

  await expect(
    client.completeDelivery({
      reservation: { ...validReservation(), ordinal: 2 },
      attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
      providerAttemptId: "provider-1",
      outcome: "SENT",
      providerReceiptId: "receipt-1",
      providerMessageId: "message-1",
    }),
  ).rejects.toThrow("unauthorized delivery retry"); // RED: currently resolves.
});
```

| Test                                                           | RED                                                                                           | GREEN                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| OR-19 legacy unknown followed by ordinal 2                     | Current parser accepts the later completion.                                                  | Client rejects the owner-unauthorized retry history.       |
| OR-20 historical pipeline/source/target/envelope/receipt drift | Add table rows that current partial validation accepts.                                       | Every tampered/reordered historical attempt fails closed.  |
| OR-07..OR-21 owner integration                                 | Preserve `wild-crag-3236`: composed E2E `3 failed, 38 passed`; exact logs partly unavailable. | Mandatory command reports each exact leaf once, all Green. |

## Verification

1. Focused OpenClaw: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`.
2. Owner-backed gate: `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`; require printed HEAD/four hashes, OR-07..OR-21 exactly once, no skip/failure, and cleanup.
3. KM composed E2E from the verified root, without bytecode/source writes: `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib OPENCLAW_FORK_ROOT=/Users/michal/Projects/openclaw-fork .venv/bin/pytest tests/integration/test_deliberation_v2_e2e.py -q -k 'test_real_producer_listener_to_ready_to_send_is_deterministic_and_audited or test_composed_send_uses_real_public_plugin_adapter_once_and_persists_fake_receipt or test_public_plugin_adapter_rejects_target_mismatch_without_fake_send'`.
4. Static/touched-surface proof: `pnpm changed:lanes --json`, `pnpm check:changed`, and `git diff --check`; add `pnpm build` only if module/package/build boundaries changed.

## Constraints

- Modify only OpenClaw files. KM source, Git metadata, service, credentials, config, and production spool remain read-only/untouched.
- Do not deploy, install/link/build in KM, restart Gateway/services, send to a live provider, or activate a pilot.
- Do not weaken owner assertions, substitute aggregate/source-build proof, or treat matching HEAD as authority.

_Status: DRAFT_
