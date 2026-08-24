# Plan 2026-08-23: Complete Deliberation Owner-Runtime Convergence

Reconcile only owner-demonstrated drift in the preserved Deliberation worktree, then close the missing cross-repository and TDD evidence.

## Analysis

- `extensions/deliberation/contracts/provenance.json` still records repository-local acceptance and an explicit KM mismatch; it cannot authorize regeneration.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` already drives the real producer, client, final adapter, owner listener, and isolated SQLite spool, but does not pin checkout revision/cleanliness or expose exact `OR-07` through `OR-21` leaves.
- `scripts/intake-producer.ts` and `src/final-adapter.ts` already express one intake call per event and reserve -> invoke -> one provider call -> completion. Preserve those paths unless the pinned owner runtime demonstrates a concrete mismatch.
- Reuse the genuine historical RED linked in `plans/checkpoints/dark-mist-2854.red-green-proof.md`. The parent's 111 local passing tests are supporting evidence, not owner-backed GREEN.
- Knowledge search used local fallback because QMD collection `openclaw-fork-learnings` was unavailable. Applicable rule: immutable owner authority must include the full SHA, contract/fixture/runtime hashes, exact OR assignment, and exact E2E selectors; setup failures are not behavioral RED.

## Available Skills

- `task-evidence`: resolve exact predecessor provenance referenced by the supplied authority bundle.
- `tdd`: link historical RED and capture fresh owner-backed GREEN in `plans/checkpoints/bold-wave-0608.red-green-proof.md`.
- `openclaw-testing`: select focused, build, changed-surface, and canonical gate proof.
- `validate-implementation` and `autoreview`: validate the bounded diff and resolve actionable findings.
- `save-learning`: mandatory final implementation-session action, with no later edits.

## Implementation

1. Require a coherent caller-supplied authority bundle containing the accepted full KM commit SHA, hashes for contract, fixtures, listener, spool/lifecycle modules, exact `OR-07`..`OR-21` ID/name assignment, and exact three composed E2E selectors. Reject current `main`, short/inferred IDs, aggregate-only results, or contradictory hashes.
2. Provision a separate read-only checkout at that SHA. Record `git rev-parse HEAD`, empty `git status --porcelain`, and every required hash in `plans/checkpoints/bold-wave-0608.red-green-proof.md`; set `OPENCLAW_DELIBERATION_KM_ROOT=<checkout>/workspace/km-system`. Never use `tmp/bold-wave-3956-agent-workspace`.
3. Compare the pinned owner contract, fixtures, listener parser, public spool APIs, SQLite attempt transitions, and E2E assertions against the current OpenClaw mirrors, producer/probe, client, adapter, and tests. Produce a field/transition ledger before editing and retain all matching existing work.
4. Invoke `skill:tdd`. Link the historical owner-listener `400 SCHEMA_INVALID` RED; add the owner-backed singular-intake and lifecycle assertions before production changes, but do not fabricate a new post-implementation RED.
5. Regenerate `contracts/km-wire-v1.json` and `contracts/cutover-controls-v1.json` only from the accepted owner artifacts. Keep `openclaw-overlay-v1.json` limited to owner-approved OpenClaw fields. Replace provenance with the full revision, all owner/runtime hashes, local mirror hashes, and repository-only evidence scope.
6. Reconcile `scripts/intake-producer.ts` and `scripts/km-spool-probe.py` only where the owner ledger differs: one authenticated provider event per durable record, history as context only, and owner public spool APIs rather than direct SQLite mutation or record-level burst authority.
7. Reconcile `src/km-client.ts` with the accepted closed schemas. Validate every historical attempt's record, ordinal, attempt/provider identity, admitted pipeline/source/target, envelope/digest, invocation, completion outcome, and receipt/failure evidence. Permit a fresh identity only for an owner-authorized never-invoked abandonment; legacy `NOT_SENT` or `DELIVERY_UNKNOWN` must not authorize retry.
8. Reconcile `src/final-adapter.ts` only if owner operations require it: reserve the immutable target, persist invocation before exactly one provider call, complete `SENT` with the exact receipt, complete only owner-defined definitive failures, and leave timeout/transport/invalid-receipt outcomes unresolved for owner fencing.
9. Restructure `scripts/km-listener.cross-repo.ts` so the authority bundle's `OR-07`..`OR-21` names each occur and report exactly once. Preserve random loopback, temporary credentials/SQLite, production-spool rejection, and cleanup. Explicitly cover the task-fixed leaves `OR-13 invocation-marker-before-one-provider-call`, `OR-14 sent-completion-exact-immutable-receipt`, `OR-16 timeout-transport-remain-delivery-unknown`, `OR-17 invoked-unknown-nonreservable-after-restart`, `OR-18 never-invoked-abandonment-fresh-attempt-id`, `OR-19 legacy-not-sent-unknown-never-authorize-retry`, and `OR-20 historical-attempt-drift-and-tamper-fail-closed`.
10. Run each exact pinned-KM E2E selector unchanged. Fix only OpenClaw producer/client/adapter defects they expose; do not edit KM or weaken owner assertions.
11. Update `extensions/deliberation/README.md` and `docs/plugins/reference/deliberation.md` only if accepted operator-visible semantics differ from their current singular-intake and ambiguity-safe wording.
12. Record all provenance, named OR results, E2E selectors, focused checks, and canonical Test Gate reference in `plans/checkpoints/bold-wave-0608.{red-green-proof,checkpoint}.md`. Run `validate-implementation`, fresh `autoreview`, then `save-learning` last.

## Files to Modify

| File                                                                                             | Change                                                                                   |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,provenance}.json`             | Regenerate from immutable owner artifacts and pin exact provenance                       |
| `extensions/deliberation/contracts/openclaw-overlay-v1.json`                                     | Change only for an approved OpenClaw-owned projection                                    |
| `extensions/deliberation/src/{contract,km-client,final-adapter}.test.ts`                         | Prove accepted schema, history, invocation, receipt, abandonment, and ambiguity behavior |
| `extensions/deliberation/src/{km-client,final-adapter}.ts`                                       | Apply only owner-demonstrated lifecycle reconciliation                                   |
| `extensions/deliberation/scripts/{intake-producer.ts,intake-producer.test.ts,km-spool-probe.py}` | Apply only demonstrated singular-record/public-API reconciliation                        |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                                      | Add immutable preflight and exact named owner-runtime leaves                             |
| `extensions/deliberation/{README.md}`, `docs/plugins/reference/deliberation.md`                  | Conditional operator-visible updates                                                     |
| `plans/checkpoints/bold-wave-0608.{red-green-proof,checkpoint}.md`                               | Historical RED link, fresh GREEN, provenance, OR, E2E, and gate evidence                 |

## TDD

Implement the cycle with `skill:tdd`.

**Historical RED:** `plans/checkpoints/bold-reef-6539.red-green-proof.md`  
**Primary test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Run command:** `OPENCLAW_DELIBERATION_KM_ROOT=<clean-approved-checkout>/workspace/km-system pnpm test:deliberation:km-integration`  
**Edit hint:** extend the existing real-listener test with `createListenerFixture`, `runIntakeProducer`, `readSpool`, and `disposeFixture`.

```ts
const secondInput = {
  ...input,
  event: { ...input.event, messageId: "1535928766595866625", content: "second event" },
  context: { ...input.context, messageId: "1535928766595866625" },
};

assert.equal((await runIntakeProducer(input, env)).duplicate, false);
assert.equal((await runIntakeProducer(secondInput, env)).duplicate, false);
assert.equal((await runIntakeProducer(input, env)).duplicate, true);
const records = readSpool(fixture);
assert.equal(records.length, 2); // Historical RED: divergent owner rejects or groups intake.
assert.equal(new Set(records.map((record) => record.recordId)).size, 2);
```

| Evidence              | Historical RED                                     | Fresh GREEN                                                                               |
| --------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Singular intake       | Positive owner intake returns `400 SCHEMA_INVALID` | Two events create two identities; exact replay creates neither                            |
| Invocation/completion | Dependent owner lifecycle leaves cannot execute    | Invocation precedes one send; exact immutable receipt completes                           |
| Recovery/history      | Owner-backed proof is absent                       | Restart fencing, authorized abandonment only, legacy non-retry, and tamper rejection pass |

## Verification

1. Owner gate: `OPENCLAW_DELIBERATION_KM_ROOT=<clean-approved-checkout>/workspace/km-system pnpm test:deliberation:km-integration`; require printed revision/hashes and each assigned `OR-07`..`OR-21` Green exactly once.
2. Focused OpenClaw: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`.
3. Plugin regression: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose`.
4. Pinned KM: run and record each authority-bundle E2E selector by exact name; aggregate totals do not substitute.
5. Quality: use `skill:openclaw-testing` for `pnpm changed:lanes --json`, the appropriate changed gate, `pnpm build`, scoped Oxlint/oxfmt, `git diff --check`, and `git diff --numstat`.
6. Submit registered `cd ~/Projects/openclaw-fork && npm test` through the caller-owned canonical Test Gate and record its reference; do not relabel a local substitute.

## Dependencies

- Caller-supplied coherent immutable authority bundle and readable clean KM checkout implementing the accepted singular-intake and ambiguity-safe lifecycle.
- KM remains read-only. Package/doctor work, deployment, live config, Gateway restart, production spool, provider send, and pilot activation remain out of scope.

---

_Status: DRAFT_
