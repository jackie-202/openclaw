# Plan 2026-08-23: Complete Deliberation KM convergence

Reconcile only the remaining owner-contract and owner-runtime gaps, preserving the existing Deliberation worktree changes.

## Analysis

- `extensions/deliberation/contracts/provenance.json` records repository-local semantics and an owner mismatch; neither its historical pin nor current KM `main` authorizes convergence.
- `plans/checkpoints/bright-cove-6185.evidence.md` confirms the original implementation ran no tests. Its blocked proof is setup evidence, not behavioral RED.
- `plans/checkpoints/bold-reef-6539.red-green-proof.md` contains a genuine owner-listener RED: positive intake fails with `400 SCHEMA_INVALID`. Reuse that provenance; never rerun the forbidden `tmp/bold-wave-3956-agent-workspace` snapshot.
- The worktree already carries broad intake, pipeline, target, invocation, receipt, and channel-ownership changes. Diff current files against the approved owner bundle and edit only demonstrated gaps.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` still reports aggregate/supporting tests rather than the required exact `OR-07` through `OR-21` leaves.

## Available Skills

- `task-evidence`: preserve exact predecessor command/outcome gaps.
- `tdd`: link the genuine historical RED and capture fresh task-local GREEN.
- `openclaw-testing`: select focused, owner-runtime, build, and changed-surface proof.
- `validate-implementation` and `autoreview`: run after implementation; resolve accepted findings before handoff.
- `save-learning`: run last, with no subsequent edits.

## Implementation

1. Obtain a caller-supplied immutable authority bundle containing the full accepted KM commit SHA, contract/fixture SHA-256 values, hashes for the listener and lifecycle modules exercised by the gate, complete `OR-07`..`OR-21` ID/name assignment, and the three composed E2E selector names. Reject short SHAs, aggregate outcomes, inferred names, current `main`, or contradictory bundles.
2. Provision a separate read-only checkout at that SHA. Record `git rev-parse HEAD`, empty `git status --porcelain`, and all requested hashes in `plans/checkpoints/dark-mist-2854.red-green-proof.md`; set `OPENCLAW_DELIBERATION_KM_ROOT=<approved-checkout>/workspace/km-system`. Treat preflight failure as BLOCKED, not RED.
3. Inspect the pinned owner contract, fixtures, request parser, spool APIs, SQLite transitions, listener, and composed E2E tests. Build a field/transition comparison against the current OpenClaw contracts, producer, client, adapter, probe, and tests before editing.
4. Invoke `skill:tdd`. Link the genuine RED from `plans/checkpoints/bold-reef-6539.red-green-proof.md`, add the missing owner-backed singular-intake and assigned lifecycle assertions first, and do not manufacture a post-implementation RED.
5. Regenerate `km-wire-v1.json` and `cutover-controls-v1.json` from the approved owner artifacts, preserving `openclaw-overlay-v1.json` only for explicitly OpenClaw-owned fields. Replace provenance with the full owner revision, owner/runtime hashes, local mirror hashes, and bounded evidence scope; do not create a hybrid schema.
6. Reconcile `scripts/intake-producer.ts` and `scripts/km-spool-probe.py` with one event per durable record. Keep history as context, remove record-level burst/debounce assumptions, and use owner public APIs rather than direct SQLite mutation.
7. Reconcile `src/km-client.ts` with the accepted closed schemas. Validate every historical attempt's record, ordinal, attempt/provider identity, pipeline, source, target, envelope/digest, invocation, completion outcome, receipt/failure evidence, and uniqueness. Permit a fresh identity only for an owner-authorized never-invoked abandonment transition; never infer retry from legacy `NOT_SENT` or `DELIVERY_UNKNOWN`.
8. Reconcile `src/final-adapter.ts` only where owner operations differ: reserve the immutable target, persist invocation before exactly one provider call, complete `SENT` with exact receipt evidence, complete only owner-defined definitive failures, and leave timeout/transport/invalid-receipt outcomes unresolved for owner fencing.
9. Rewrite `scripts/km-listener.cross-repo.ts` so every authority-bundle `OR-07`..`OR-21` name appears exactly once and prints an individual result. Include the task-fixed `OR-13`, `OR-14`, and `OR-16`..`OR-20` names; assert durable identities, exact target/envelope/receipt, one provider call, restart non-reservability, abandonment identity rules, legacy non-retry, and no mutation/send on tamper. Keep auth, production-spool, and cleanup guards outside OR totals.
10. Run the three exact pinned-KM E2E selectors. Repair only an OpenClaw producer/client/adapter defect exposed by unchanged owner assertions; never edit KM or weaken owner tests.
11. Update `extensions/deliberation/README.md` and `docs/plugins/reference/deliberation.md` only if accepted operator-visible names or behavior differ from their current singular-intake and ambiguity-safe wording.
12. Record exact owner provenance, all named OR results, focused tests, composed E2E results, changed gates, and remaining gaps in the task proof/checkpoint. Run `validate-implementation`, fresh `autoreview`, then `save-learning` as the final action.

## Files to Modify

| File                                                                                             | Change                                                                      |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,provenance}.json`             | Regenerate owner mirrors and pin exact immutable provenance                 |
| `extensions/deliberation/contracts/openclaw-overlay-v1.json`                                     | Change only for an approved OpenClaw-owned projection                       |
| `extensions/deliberation/src/{contract,km-client,final-adapter}.test.ts`                         | Prove accepted schema, lifecycle, history, receipt, and ambiguity behavior  |
| `extensions/deliberation/src/{km-client,final-adapter}.ts`                                       | Minimal owner-contract reconciliation demonstrated by RED                   |
| `extensions/deliberation/scripts/{intake-producer.ts,intake-producer.test.ts,km-spool-probe.py}` | Singular intake and public owner-spool preparation                          |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                                      | Exact preflight and named `OR-07`..`OR-21` owner-runtime leaves             |
| `extensions/deliberation/{README.md}`, `docs/plugins/reference/deliberation.md`                  | Conditional operator-visible contract update                                |
| `plans/checkpoints/dark-mist-2854.{red-green-proof,checkpoint}.md`                               | Historical RED link, fresh GREEN, provenance, OR, E2E, and focused evidence |

## TDD

Implement the cycle with `skill:tdd`.

**Historical RED:** `plans/checkpoints/bold-reef-6539.red-green-proof.md`  
**Primary test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Run command:** `OPENCLAW_DELIBERATION_KM_ROOT=<clean-approved-checkout>/workspace/km-system pnpm test:deliberation:km-integration`  
**Edit hint:** extend `real producer reaches the isolated KM listener and canonical spool` using its existing real imports, `createListenerFixture`, `runIntakeProducer`, `readSpool`, and `disposeFixture`.

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
assert.equal(records.length, 2); // RED: divergent owner rejects or groups singular intake.
assert.equal(new Set(records.map((record) => record.recordId)).size, 2);
```

| Evidence              | RED                                                           | GREEN                                                                   |
| --------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Singular intake       | Approved owner rejects or groups two distinct events          | Two records; exact replay preserves count and identities                |
| Invocation/completion | Assigned lifecycle leaves fail before durable evidence checks | Invocation precedes one send; exact receipt/failure evidence completes  |
| Recovery/history      | Unknown/legacy state retries or tampered history parses       | Restart fencing, authorized abandonment only, and all drift fail closed |

## Verification

1. Owner gate: `OPENCLAW_DELIBERATION_KM_ROOT=<clean-approved-checkout>/workspace/km-system pnpm test:deliberation:km-integration`; require exact revision/hashes and every assigned `OR-07`..`OR-21` Green exactly once.
2. Focused OpenClaw: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`.
3. Plugin regression: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose`.
4. Pinned KM: run each authority-bundle E2E selector by exact name and record its command/result; no aggregate substitute.
5. Quality: `pnpm changed:lanes --json`, `pnpm check:changed`, `pnpm build`, scoped Oxlint/oxfmt checks, `git diff --check`, and `git diff --numstat`.
6. Submit the registered `cd ~/Projects/openclaw-fork && npm test` only through the caller-owned canonical Test Gate; do not relabel a local substitute as canonical evidence.

## Dependencies

- Caller-supplied immutable authority bundle and readable clean KM checkout implementing the accepted singular-intake and ambiguity-safe lifecycle.
- KM remains read-only; deployment, live config, Gateway restart, production spool, provider send, package/doctor work, and pilot activation remain out of scope.

---

_Status: DRAFT_
