# Plan 2026-08-23: Preserve singular intake and uncertain-delivery safety

_Task: `calm-crag-4037`_  
_Status: DRAFT_

## Progress

- [x] Phase 0: Config and initialization
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- Discord and Slack already preserve provider-event identity through separate authenticated intake calls; existing route, hook, queue, and loader tests cover root/child separation. Do not change ingress production code.
- `extensions/deliberation/contracts/km-wire-v1.json` still defines a 60-second burst and record-level `messages[]`, so separate calls do not prove separate durable records.
- `extensions/deliberation/src/final-adapter.ts` records invocation before one provider call, but each poll trusts a fresh KM reservation. `extensions/deliberation/src/km-client.ts` accepts `DELIVERY_UNKNOWN` followed by a later attempt and does not require proof for `NOT_SENT`.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` is the real SQLite/listener path; it currently covers duplicate replay, not two distinct same-window events or restart-safe uncertainty.
- `plans/checkpoints/warm-mist-6808.evidence.md` records no parent verification evidence. There is no historical RED to reuse.

### Relevant documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` makes history context-only and requires at most one attempt/receipt with no reroute.
- `docs/plugins/reference/deliberation.md` and `extensions/deliberation/README.md` already claim separate intake and unresolved ambiguity, but do not define proof-authorized recovery.
- `docs/reference/test.md` requires focused `pnpm test` proof before changed gates.

### Knowledge base

- Recall used deterministic local fallback because `openclaw-fork-learnings` is absent. Relevant returned rules require external protocol authority and contract convergence before behavioral TDD; dependency/setup failures are not valid RED.
- Acceptance work must not invent missing KM fields. A readable owner-approved singular-record and retry-proof contract remains a hard prerequisite.

## Available Skills

- `tdd`: capture genuine assertion-level RED/GREEN in `plans/checkpoints/calm-crag-4037.red-green-proof.md`.
- `task-evidence`: parent evidence is materialized at `plans/checkpoints/warm-mist-6808.evidence.md`.
- `openclaw-testing`: select focused plugin tests, owner integration, build, lint, and changed gates.
- `validate-implementation`, `autoreview`, `save-learning`: close out implementation, review, and mandatory learning capture.

## Approach

Make KM durable state the only resend authority. Adopt an owner-approved contract that stores one admitted event per record, keeps history outside record identity, makes invoked ambiguity non-reservable, and attaches closed durable authorization to any later reservation. Validate that authorization and all prior attempt identities before `km.invoke`; retain the existing single native adapter call and exact receipt completion path.

## Implementation

1. Obtain a readable, owner-approved KM revision and exact contract/fixture hashes for singular records, `DELIVERY_UNKNOWN`, proven `NOT_SENT`, and fresh-reservation authorization. Compare the real owner files and runtime, then update `provenance.json`; stop without production edits if fields or executable semantics are missing.
2. Invoke `skill:tdd`. Link `plans/checkpoints/warm-mist-6808.evidence.md` as proof that no parent RED exists. Before repair code, add failing parser/adapter assertions and owner-backed Discord/Slack durable scenarios; capture only assertion failures, never provenance/setup failures, in `plans/checkpoints/calm-crag-4037.red-green-proof.md`.
3. Replace the mirrored burst/multi-message record contract with the exact owner handoff: one immutable `inboundId`/provider event per durable record, thread identity and history as context only, and idempotent replay returning the same record without creating another item.
4. Parse owner-defined delivery authorization into a closed result in `km-client.ts`. Reject duplicate ordinals/attempt IDs/provider-attempt IDs, envelope or receipt drift, unknown followed by another attempt, and `NOT_SENT` without canonical proof. Permit a fresh attempt only when the reservation carries exact durable never-invoked or proven-`NOT_SENT` authorization.
5. Require that parsed authorization in `final-adapter.ts` before invocation. Keep one `ready -> reserve -> invoke -> provider.send -> complete` path; ambiguity returns without completion, retry, reroute, fallback, or process-local compatibility fencing.
6. Remove timeout/transport from definitive `FAILED` evidence; retain only explicit provider rejection classes. Replace the timeout-as-failed fixture with terminal unknown and proof-authorized recovery fixtures from the owner handoff.
7. Extend `km-listener.cross-repo.ts` with table-driven Discord and Slack root/child pairs, duplicate replay, timeout/transport ambiguity, listener/adapter restart, duplicate evidence, receipt mismatch, forbidden post-unknown replay, and allowed proven-`NOT_SENT` recovery. Assert record IDs, history identity, provider call count, attempt identity, and receipt identity.
8. Add only missing channel/hook integration assertions connecting authenticated root/child events to distinct durable responses. Do not duplicate KM state policy or edit Discord/Slack ingress production code.
9. Capture GREEN with each RED command, then run focused tests, owner integration, scoped lint, build, changed lanes/gate, `skill:validate-implementation`, and fresh `skill:autoreview`. Submit `cd ~/Projects/openclaw-fork && npm test` to the caller-owned canonical Test Gate and record its run reference.
10. Align the Deliberation reference/README with executable one-record and proof-authorized recovery behavior. Run `skill:save-learning` last.

## Files to Modify

| File                                                                                                                                                                                                                                               | Change                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/km-wire-v1.json`                                                                                                                                                                                                | Mirror owner singular-record and closed recovery schemas                                |
| `extensions/deliberation/contracts/cutover-controls-v1.json`                                                                                                                                                                                       | Add the complete lifecycle matrix; remove timeout-as-`FAILED`                           |
| `extensions/deliberation/contracts/provenance.json`                                                                                                                                                                                                | Pin exact readable owner revision and hashes                                            |
| `extensions/deliberation/src/contract.test.ts`                                                                                                                                                                                                     | Execute singular-record, uncertainty, and retry-proof fixtures                          |
| `extensions/deliberation/src/km-client.ts`, `extensions/deliberation/src/km-client.test.ts`                                                                                                                                                        | Parse and enforce durable attempt authorization/history                                 |
| `extensions/deliberation/src/final-adapter.ts`, `extensions/deliberation/src/final-adapter.test.ts`                                                                                                                                                | Fence invocation before the sole provider call, including restart                       |
| `extensions/deliberation/src/delivery-composition.test.ts`                                                                                                                                                                                         | Preserve one native Discord/Slack attempt under ambiguity                               |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`, `extensions/deliberation/scripts/km-spool-probe.py`                                                                                                                                   | Prove durable records, replay, restart, recovery, and receipts in isolated SQLite state |
| `extensions/deliberation/src/hooks.test.ts`, `extensions/discord/src/monitor/message-handler.queue.test.ts`, `extensions/discord/src/monitor/message-handler.process.test.ts`, `extensions/slack/src/monitor/message-handler.deliberation.test.ts` | Fill only missing root/child durable-response assertions                                |
| `docs/plugins/reference/deliberation.md`, `extensions/deliberation/README.md`                                                                                                                                                                      | Document one-record intake and proof-authorized recovery                                |
| `plans/checkpoints/calm-crag-4037.red-green-proof.md`                                                                                                                                                                                              | Tool-generated RED/GREEN evidence                                                       |

## TDD

Implementace TDD cyklu dle skill:tdd.

`plans/checkpoints/warm-mist-6808.evidence.md` reports `Verification evidence: none` for both parent sessions, so there is no genuine historical RED to reuse. Do not reconstruct one. After the owner-contract preflight succeeds, create fresh RED before this repair's production/contract edits.

**Primary test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Framework:** Node test against the real owner listener and isolated SQLite spool  
**Run command:** `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration`  
**Edit hint:** extend `test("real producer reaches the isolated KM listener and canonical spool")` using its existing `node:test`, producer, listener, and `readSpool` helpers; table-drive both providers and root/child identity after the first RED is established.

```ts
const secondInput = {
  ...input,
  event: {
    ...input.event,
    messageId: "1535928766595866625",
    content: "second event in the same source window",
  },
  context: { ...input.context, messageId: "1535928766595866625" },
} as const;

assert.deepEqual(await runIntakeProducer(secondInput, env), {
  handled: true,
  providerEventId: secondInput.event.messageId,
  duplicate: false,
});

const records = readSpool(fixture);
assert.equal(records.length, 2); // RED: burst semantics currently group the events.
assert.equal(new Set(records.map((record) => record.recordId)).size, 2);
```

| Test                                                 | RED                                                        | GREEN                                                               |
| ---------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| Unknown followed by another attempt                  | Current parser resolves successfully                       | Rejected before provider invocation                                 |
| `NOT_SENT` without proof / with exact proof          | Both histories are unqualified                             | Missing proof rejected; exact proof authorizes one fresh attempt ID |
| Discord/Slack root and child pairs inside 60 seconds | Owner spool groups events or lacks two-record proof        | Two record IDs; shared history only                                 |
| Timeout/transport plus restart                       | Fresh reservation can produce call 2 or definitive failure | Terminal unknown; provider call count remains 1                     |
| Replay, duplicate evidence, receipt mismatch         | Matrix incomplete or contradictory history accepted        | No extra item/attempt; mismatch fails closed                        |

Capture RED and GREEN around the same durable command:

```bash
TASK_ID=calm-crag-4037 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration
# After implementation, repeat with `green` and the identical trailing command.
```

After GREEN:

```bash
pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/hooks.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts -- --reporter=verbose
env OPENCLAW_DELIBERATION_KM_ROOT="<approved-converged-km-root>" pnpm test:deliberation:km-integration
pnpm lint:extensions -- extensions/deliberation extensions/discord extensions/slack
pnpm build
pnpm changed:lanes --json
pnpm check:changed
```

## Dependencies

- A readable, owner-approved KM checkout implementing the exact singular-record and proof-bearing recovery contract is blocking; the currently recorded checkout is hash- and semantics-mismatched.
- Keep existing immutable pipeline/target, one-message native adapters, and exact receipt identity unchanged.
- The heavily dirty worktree contains adjacent completed changes; implementation must preserve them and scope review/proof to task-owned hunks.
- Caller infrastructure owns the canonical `npm test` Test Gate reference; local output cannot substitute for it.
- Live config, credentials, allowlists, rollout, provider sends, and release work are out of scope.
