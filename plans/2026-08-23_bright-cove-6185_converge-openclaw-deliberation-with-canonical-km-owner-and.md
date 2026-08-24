# Plan 2026-08-23: Converge OpenClaw Deliberation with canonical KM owner and cross-repository gate

Converge the OpenClaw consumer and owner-backed gate on the accepted singular-intake, ambiguity-safe KM lifecycle without changing KM or activating live behavior.

_Status: DRAFT_

## Authority Gate

- `plans/checkpoints/bright-cove-6185.evidence.md` has no implementation-session evidence. Before any product or test edit, obtain the preceding KM task's final exact commit SHA, contract SHA-256, fixture SHA-256, complete `wild-crag-3236` OR-07..OR-21 assignment, and the three failing composed E2E selectors. Stop if any value is absent, contradictory, or later changes.
- Provision or use an isolated KM checkout at that SHA. Require `git rev-parse HEAD` equality, empty tracked/untracked status, exact hashes for `km-system/contracts/deliberation-v2/v1/{contract,fixtures}.json`, and a readable owner listener/runtime. Never use `tmp/bold-wave-3956-agent-workspace` or the stale hashes in current `extensions/deliberation/contracts/provenance.json`.
- Set `OPENCLAW_DELIBERATION_KM_ROOT=<clean-pinned-checkout>/workspace/km-system`; keep KM read-only and all listener credentials, SQLite, and temporary files isolated.

## Current Boundaries

- `extensions/deliberation/src/intake.ts` and `extensions/deliberation/scripts/intake-producer.ts` already issue one intake call per authenticated event. Burst authority remains in `contracts/km-wire-v1.json`, `src/km-client.ts`, `src/km-client.test.ts`, `scripts/km-spool-probe.py`, and `scripts/km-listener.cross-repo.ts`.
- `extensions/deliberation/src/final-adapter.ts` already orders reserve -> durable invoke -> one provider call -> completion and treats non-authoritative provider errors as ambiguous. The missing proof is owner-backed restart fencing, fresh identity only for never-invoked abandonment, legacy outcome non-retry, and immutable validation of every historical attempt.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` preserves random loopback, temporary credential/SQLite, production-spool rejection, and cleanup, but checks hashes without revision/cleanliness and reports stale aggregate/burst cases rather than assigned OR leaves.
- `docs/plugins/reference/deliberation.md:141-159` and `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:61-132` already state the target singular/no-fallback behavior.

## Available Skills

- `task-evidence`: resolve exact predecessor evidence; the current task artifact exposes the missing implementation evidence.
- `tdd`: capture the owner-backed durable RED/GREEN with an identical command.
- `validate-implementation`: verify owner boundary, requested scope, and architecture after implementation.
- `code-review`: perform the pre-handoff changed-surface review.
- `save-learning`: record findings as the final implementation action.

## Implementation

1. Record the accepted KM SHA, owner hashes, OR assignment, and composed E2E selectors in `plans/checkpoints/bright-cove-6185.red-green-proof.md`. Verify the isolated checkout and compare the owner contract, fixtures, listener request parsing, SQLite intake/delivery transitions, and restart behavior with OpenClaw's mirrors. Treat checkout/hash failures as setup failures, not RED.
2. Invoke `skill:tdd`. First add owner-backed failing leaves for two distinct same-window events plus exact replay and for the lifecycle cases named by the accepted assignment. Capture RED with the mandatory integration command only after revision, cleanliness, and hash preflight succeeds.
3. Replace OpenClaw's KM-owned mirrors from the accepted owner files without combining old and new fields. Remove burst/debounce and record-level multi-event authority; retain history only as source context. Regenerate lifecycle fixtures from the accepted owner fixture cases and update provenance with the exact commit, owner hashes, local mirror hashes, and repository-only scope.
4. Reconcile `src/km-client.ts` with the accepted singular record and closed attempt schemas. Validate every attempt's ordering, admitted `pipelineId`, source, target, durable envelope/digest, invocation evidence, completion outcome, and immutable receipt/failure evidence. Reject historical drift/tampering and ensure `NOT_SENT`/`DELIVERY_UNKNOWN` cannot imply retry unless the accepted owner contract contains an explicit authorized transition.
5. Reconcile `src/final-adapter.ts` only where the accepted contract exposes a different typed client operation or result. Reserve the immutable durable envelope without override, persist invocation before exactly one provider call, complete only `SENT` or authoritative permission/rejection/rate-limit failures, and leave timeout/transport/invalid-receipt outcomes for owner terminal invoked-unknown fencing.
6. Convert `scripts/km-spool-probe.py` from debounce closure and `record.messages[]` assumptions to the accepted singular-record public API. Keep history construction separate from the admitted event and use owner APIs rather than direct SQLite manipulation.
7. Rewrite `scripts/km-listener.cross-repo.ts` into the exact accepted `OR-07`..`OR-21` leaves. Include the task-fixed names for OR-13, OR-14, OR-16..OR-20; source every other name from `wild-crag-3236`. Assert per leaf rather than by totals: durable record/attempt identities, exact envelope/receipt, provider-call count, restart non-reservability, fresh attempt only after never-invoked abandonment, and no mutation/send on drift. Keep auth/protocol negatives and all isolation/cleanup guards as supporting tests outside OR accounting.
8. Add preflight output and failure checks for the exact KM SHA, clean checkout, and owner hashes. Make missing, duplicate, skipped, stale, or misnamed assigned leaves fail the command; print one result for each leaf.
9. Run the three exact composed KM E2E selectors from the pinned checkout. Repair only the OpenClaw producer/client/adapter boundary exposed by those unchanged assertions; do not edit KM or weaken owner tests.
10. Update `extensions/deliberation/README.md` or `docs/plugins/reference/deliberation.md` only if the accepted owner names or operator-visible integration output changed. Do not touch package/doctor, deployment, live config, Gateway, production spool, provider send, or pilot surfaces.
11. Run focused and cross-repository verification, `skill:validate-implementation`, and a fresh changed-surface review. Resolve actionable findings and rerun affected proof. Invoke `skill:save-learning` last and make no subsequent edits.

## Files To Modify

| File                                                                                                            | Change                                                                                                  |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,provenance}.json`                            | Replace only from accepted owner contract/fixtures; pin exact owner and local hashes.                   |
| `extensions/deliberation/contracts/{source-identity-v1,openclaw-overlay-v1}.json`                               | Change only if the accepted owner artifact changes these owned projections.                             |
| `extensions/deliberation/src/contract.test.ts`                                                                  | Assert the exact accepted revision/hashes and singular, ambiguity-safe fixture semantics.               |
| `extensions/deliberation/src/km-client.ts`                                                                      | Parse the canonical singular record/lifecycle and fail closed on every historical-attempt drift.        |
| `extensions/deliberation/src/km-client.test.ts`                                                                 | Replace retained/burst-era positives with canonical historical, abandonment, unknown, and tamper cases. |
| `extensions/deliberation/src/final-adapter.ts`, `extensions/deliberation/src/final-adapter.test.ts`             | Align typed lifecycle calls and prove invoke-before-one-send plus definitive/ambiguous outcomes.        |
| `extensions/deliberation/scripts/km-spool-probe.py`                                                             | Prepare/read singular records through accepted owner APIs without debounce grouping.                    |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                                                     | Add revision/cleanliness proof and exact named OR-07..OR-21 owner-runtime leaves.                       |
| `extensions/deliberation/scripts/intake-producer.ts`, `extensions/deliberation/scripts/intake-producer.test.ts` | Conditional accepted-schema reconciliation; preserve one call per event.                                |
| `extensions/deliberation/README.md`, `docs/plugins/reference/deliberation.md`                                   | Conditional operator/public wording only when accepted semantics alter current text.                    |
| `plans/checkpoints/bright-cove-6185.red-green-proof.md`                                                         | Exact owner authority, RED/GREEN, named leaf, E2E, and focused command evidence.                        |

## TDD

Implement the cycle with `skill:tdd`; write proof to `plans/checkpoints/bright-cove-6185.red-green-proof.md`.

**Primary test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Framework:** Node test against the accepted listener and isolated SQLite spool  
**Run command:** `OPENCLAW_DELIBERATION_KM_ROOT=<clean-pinned-checkout>/workspace/km-system pnpm test:deliberation:km-integration`  
**Edit hint:** append after existing listener/spool helpers and reuse `createListenerFixture`, `runIntakeProducer`, `readSpool`, and `disposeFixture`.

```ts
void test("two-same-window-events-create-two-durable-records", async () => {
  const fixture = await createListenerFixture();
  try {
    const first = integrationProducerInput(fixture.context.endpoint, {
      messageId: "event-1",
      content: "first",
    });
    const second = integrationProducerInput(fixture.context.endpoint, {
      messageId: "event-2",
      content: "second",
    });
    const env = { OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential };

    assert.equal((await runIntakeProducer(first, env)).duplicate, false);
    assert.equal((await runIntakeProducer(second, env)).duplicate, false);
    assert.equal((await runIntakeProducer(first, env)).duplicate, true);

    const records = readSpool(fixture);
    assert.equal(records.length, 2); // RED: burst-era owner/mirror collapses the events.
    assert.equal(new Set(records.map((record) => record.recordId)).size, 2);
  } finally {
    await disposeFixture(fixture);
  }
});
```

Add `integrationProducerInput` as a local test-data builder from the existing valid producer payload; it must not encode owner semantics.

| Test                                                | RED                                                                                                  | GREEN                                                                                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `two-same-window-events-create-two-durable-records` | Intake is rejected or two events collapse into one record.                                           | Two immutable records exist; exact replay changes neither count nor identity; assign its OR ID only from `wild-crag-3236`.              |
| `OR-13` / `OR-14`                                   | Invocation ordering or exact receipt evidence is absent/drifts.                                      | Invocation is durable before one send; completion binds the exact immutable receipt.                                                    |
| `OR-16`..`OR-20`                                    | Ambiguity requeues, abandonment reuses identity, legacy outcomes retry, or historical tamper parses. | Unknown is terminal/nonreservable after restart; only never-invoked abandonment gets a fresh ID; legacy/tampered evidence fails closed. |

## Verification

1. Mandatory owner gate: `OPENCLAW_DELIBERATION_KM_ROOT=<clean-pinned-checkout>/workspace/km-system pnpm test:deliberation:km-integration`. Require printed exact SHA/hashes, every assigned OR-07..OR-21 leaf Green exactly once, and supporting isolation/cleanup tests Green.
2. Focused OpenClaw: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`, then `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose`.
3. Pinned KM: run the exact three composed E2E selectors from predecessor evidence, or its full deterministic E2E command only if selector names changed. Record each selector and result; no aggregate substitute.
4. Scoped quality: run the repository extension lint/format checks selected for the touched files, `git diff --check`, and `git diff --numstat`; trim unjustified production LOC growth.
5. Final evidence must state the KM SHA/hashes, clean checkout command/output, all named OR results, mandatory gate result, KM E2E results, focused OpenClaw results, and any proof gap. Stop if owner evidence differs from the planning handoff.

## Dependencies

- Immutable final evidence from the preceding KM task and `wild-crag-3236`; current task lineage has no substitute.
- Clean isolated KM checkout with its maintained Python environment, listener, and deterministic E2E command.
- KM remains read-only; no package/doctor, deployment, build/link/install, Gateway, live provider, production spool, or pilot work.
