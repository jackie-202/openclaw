# Plan 2026-08-23: Repair singular durable event intake

_Task: `cool-wave-8905`_  
_Status: DRAFT_

## Analysis

- `extensions/deliberation/src/intake.ts` already sends one authenticated `client.intake(...)` call per admitted event; Discord and Slack ingress are complete and stay unchanged.
- `extensions/deliberation/contracts/km-wire-v1.json` still defines 60-second burst aggregation and `record.messages[]`; this contradicts the separate-item rule in `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md`.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` is the authoritative OpenClaw-to-KM SQLite test, but it covers only replay of one event into one record.
- `extensions/deliberation/contracts/provenance.json` records owner hash and semantic mismatch. Obtain a readable owner-approved KM revision before changing tests or mirrors; setup/provenance failures are not RED.
- `plans/checkpoints/warm-mist-6808.evidence.md` contains no historical RED, and `plans/checkpoints/calm-crag-4037.checkpoint.md` confirms no implementation followed. A fresh behavioral RED is required.

## Available Skills

- `tdd`: capture assertion-level RED/GREEN in `plans/checkpoints/cool-wave-8905.red-green-proof.md`.
- `openclaw-testing`: select focused supplemental tests after the owner-backed GREEN.
- `validate-implementation`, `autoreview`, and `save-learning`: run after implementation and verification.

## Implementation

1. Set `OPENCLAW_DELIBERATION_KM_ROOT` to a readable owner-approved checkout. Inspect its scoped instructions, contract, fixtures, intake/storage implementation, and tests. Require an owner-defined singular record shape with one immutable `inboundId` per provider event and idempotent replay returning the same record; stop rather than inventing fields if that contract is absent.
2. Invoke `skill:tdd`. Extend the existing owner-backed test with two distinct authenticated events inside the former 60-second window, then replay one event. Capture RED only when the durable assertions show one grouped record instead of two; link the parent evidence showing no reusable historical RED.
3. In the KM owner repository, replace source-window burst grouping with provider-event-keyed admission: create one durable record for each new authenticated event, return the existing record for an exact replay, reject conflicting replay, and keep source thread identity only as the key for later history retrieval. Update the owner contract, fixtures, migration/schema handling, and focused owner tests together.
4. Mirror the accepted owner contract into `extensions/deliberation/contracts/km-wire-v1.json`: remove burst/debounce and record-level multi-event authority, retain one record-level event identity, and leave `sourceContext.messages` as history evidence only. Refresh `cutover-controls-v1.json` only where owner record projections changed, then update exact owner/local hashes and convergence claims in `provenance.json`.
5. Align OpenClaw consumers with the accepted record projection. Remove grouped-record parsing from `src/km-client.ts`; update `km-spool-probe.py` to read the owner’s singular event identity through its public spool projection, without raw SQLite or duplicate transition logic.
6. Complete the cross-repository test assertions: two distinct events produce two distinct `recordId`/`inboundId` pairs, both records retain the expected thread/history identity, replay returns `duplicate:true` with the original pair, and the durable record count remains two.
7. Capture GREEN with the identical owner-backed command used for RED. Run focused contract/client tests, build-sensitive validation only if published or lazy boundaries changed, then `skill:validate-implementation` and fresh `skill:autoreview`; resolve all accepted findings.
8. Update `docs/plugins/reference/deliberation.md` or `extensions/deliberation/README.md` only if the accepted owner terminology or operator command changed; their current one-event/history-only statements already describe the target behavior. Run `skill:save-learning` last.

## Files to Modify

| File                                                                                        | Change                                                                               |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `<approved-km-root>/contracts/deliberation-v2/v1/{contract,fixtures}.json`                  | Define and fixture one durable record per provider event                             |
| `<approved-km-root>/<owner intake/storage files and focused tests>`                         | Replace burst grouping with singular idempotent admission using owner-selected files |
| `extensions/deliberation/contracts/km-wire-v1.json`                                         | Mirror the singular owner record and history-only context shape                      |
| `extensions/deliberation/contracts/cutover-controls-v1.json`                                | Refresh only affected owner projections/fixtures                                     |
| `extensions/deliberation/contracts/provenance.json`                                         | Pin the approved owner revision and exact hashes                                     |
| `extensions/deliberation/src/contract.test.ts`                                              | Reject burst/multi-event record authority                                            |
| `extensions/deliberation/src/km-client.ts`, `extensions/deliberation/src/km-client.test.ts` | Parse the singular record projection                                                 |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                                 | Add two-event and replay durable assertions                                          |
| `extensions/deliberation/scripts/km-spool-probe.py`                                         | Read singular event identity through owner APIs                                      |
| `plans/checkpoints/cool-wave-8905.red-green-proof.md`                                       | Store matching-command TDD evidence                                                  |

## TDD

Implementace TDD cyklu dle skill:tdd.

**Test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Framework:** `node:test` against the real owner listener and isolated SQLite spool  
**Run command:** `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration`  
**Edit hint:** append to `test("real producer reaches the isolated KM listener and canonical spool")` before owner runtime or mirrored contract edits.

```ts
const secondInput = {
  ...input,
  event: { ...input.event, messageId: "1535928766595866625", content: "second event" },
  context: { ...input.context, messageId: "1535928766595866625" },
} as const;

const second = await runIntakeProducer(secondInput, env);
assert.deepEqual(second, {
  handled: true,
  providerEventId: secondInput.event.messageId,
  duplicate: false,
});

const recordsAfterDistinctEvents = readSpool(fixture);
assert.equal(recordsAfterDistinctEvents.length, 2); // RED: current owner groups the events.
assert.equal(new Set(recordsAfterDistinctEvents.map((record) => record.recordId)).size, 2);
assert.equal(new Set(recordsAfterDistinctEvents.map((record) => record.inboundId)).size, 2);

assert.equal((await runIntakeProducer(secondInput, env)).duplicate, true);
assert.equal(readSpool(fixture).length, 2);
```

| Assertion                       | RED                                       | GREEN                                                                          |
| ------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| Two distinct same-window events | Owner spool contains one grouped record   | Spool contains two distinct record/inbound identities                          |
| Exact replay                    | Replay mutates grouped authority or count | Replay returns `duplicate:true` and preserves the original record/count        |
| Thread peers                    | Record-level event array owns peers       | Each record owns one event; shared thread data appears only in history context |

Capture both phases with the identical trailing command:

```bash
TASK_ID=cool-wave-8905 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration
TASK_ID=cool-wave-8905 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration
```

After GREEN:

```bash
pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose
pnpm check:changed
```

## Dependencies

- A readable, owner-approved KM checkout with authority to change its durable intake model is blocking; the currently recorded checkout is mismatched.
- Preserve all unrelated dirty-worktree changes and limit edits/review to task-owned hunks.
- Do not change channel ingress, uncertain-delivery behavior, live configuration, rollout controls, credentials, or provider sends for this acceptance repair.
