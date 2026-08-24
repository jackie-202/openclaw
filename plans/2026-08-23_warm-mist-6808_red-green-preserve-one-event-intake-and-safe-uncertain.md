# Plan 2026-08-23: Preserve one-event intake and safe uncertain-delivery semantics

_Task: `warm-mist-6808`_  
_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/contracts/km-wire-v1.json:8,25,264-299` still makes a 60-second source burst and `messages[]` authoritative for one record; `extensions/deliberation/src/intake.ts:64-120` already submits each authenticated provider event independently and stores thread identity separately.
- `extensions/deliberation/src/km-client.ts:412-594` accepts retained `DELIVERY_UNKNOWN` without checking later attempt ordering; `extensions/deliberation/src/km-client.test.ts:1544-1586` positively accepts unknown followed by another successful attempt.
- `extensions/deliberation/src/final-adapter.ts:103-166` records invocation before one provider call and correctly leaves transport/receipt ambiguity unresolved, but each new poll trusts KM `ready -> reserve`; no process-local fence could survive restart.
- `extensions/deliberation/contracts/km-wire-v1.json:146-170,327-332` and `cutover-controls-v1.json:1865-1993` contradict each other: timeout is accepted as definitive `FAILED`, while recovery prose says invoked ambiguity is non-reservable.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts:476-558` exercises the real producer, listener, and disposable SQLite spool but currently asserts one debouncing multi-message record. It is the authentic durable path for the required RED.
- Existing Discord/Slack owner fixtures prove separate pre-debounce calls and root/child identity, but not distinct durable record IDs: `extensions/discord/src/monitor/message-handler.queue.test.ts:209-290`, `extensions/slack/src/monitor/message-handler.deliberation.test.ts:159-216`, and `extensions/deliberation/src/hooks.test.ts:118-186`.

### Relevant documentation

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:72-87,124-134` fixes thread history as context only and requires one item, at most one provider attempt, one receipt, and no fallback.
- `docs/plugins/reference/deliberation.md:141-159` already claims separate durable intake and no retry; update it to state the exact `DELIVERY_UNKNOWN -> NOT_SENT proof -> fresh reservation` rule once executable evidence matches.
- `extensions/deliberation/README.md:3-18` defines `pnpm test:deliberation:km-integration` as the real isolated owner-listener gate.
- `docs/plugins/sdk-testing.md:199-218` requires loader-backed tests for plugin registration/ownership surfaces and focused SDK test imports.
- `plans/investigations/warm-cove-4137_audit-openclaw-deliberation-remediation-and-rollout-safety.md:23-31,46-54` is the source audit for these three violations.

### Knowledge base

- `learnings/architecture/cool-vale-5964-canonical-delivery-recovery.md`: `NOT_SENT` reconciliation may only requeue into the canonical `ready -> reserve -> invoke -> complete` path with a fresh attempt ID; it must not create another send path.
- `learnings/architecture/calm-vale-6983-invalid-receipts-are-unknown-outcomes.md`: only explicit provider rejection is definitive `FAILED`; transport exceptions and malformed resolved receipts remain uncertain after durable invocation.
- Recall used local fallback because collection `openclaw-fork-learnings` was absent. Returned protocol-authority stubs added no executable rule; owner-authored wire fields and fixtures remain a hard gate.

## Available Skills

- `compound-plan`: maintain this plan at its canonical task path.
- `recall-knowledge`: retrieve repository learnings before synthesis.
- `tdd`: capture genuine RED and GREEN output in `plans/checkpoints/warm-mist-6808.red-green-proof.md`.
- `validate-implementation`: verify the finished change against architecture and acceptance criteria.
- `save-learning`: record implementation findings as the final action of the implementation task.

## Solution

Make the durable KM state machine, not OpenClaw process memory, the retry authority. Consume one owner-synchronized wire handoff that removes burst/multi-message record authority, represents each provider event as one record, terminalizes invoked ambiguity as non-reservable `DELIVERY_UNKNOWN`, and exposes closed durable authorization for any later reservation only after proven `NOT_SENT` (or a never-invoked abandonment). Validate that authorization and all prior attempt ordering before `km.invoke`; keep immutable pipeline/target and exact receipt checks unchanged.

## Implementation

1. Obtain the owner-approved KM contract, fixtures, and immutable revision/hash that define the singular record shape, unknown recovery, required `NOT_SENT` proof, and pre-send retry authorization. Stop if the handoff is absent or does not expose enough reservation evidence for OpenClaw to reject an unauthorized post-unknown attempt before provider invocation; do not invent field names or add a local cache/sidecar.
2. Invoke `skill:tdd`. Before production or contract edits, add the complete RED matrix to the existing tests and integration harness, then capture assertion-level RED in `plans/checkpoints/warm-mist-6808.red-green-proof.md`. Import/setup/provenance failures are not valid RED.
3. Replace the mirrored burst contract and fixtures from the owner handoff: remove `burstPolicy`, record-level `messages[]`, debounce fields, and multi-event record semantics; require one immutable admitted event/`inboundId` per record. Preserve source thread identity and history snapshots as context only. Refresh `provenance.json` from exact owner/local hashes.
4. Align `km-client.ts` with the closed handoff. Parse the owner-defined reservation authorization into a closed internal union, reject unknown followed by another attempt without proven `NOT_SENT`, require proof/reconciliation fields for `NOT_SENT`, compare every historical envelope with the record's immutable pipeline/source/target, and reject duplicate ordinal/attempt/provider-attempt identities and receipt drift.
5. In `final-adapter.ts`, keep the sole `ready -> reserve -> invoke -> provider.send -> complete` path. Require parsed durable authorization before `invoke`; allow first delivery or a fresh reservation backed by never-invoked/`NOT_SENT` evidence, and return without invoking for unknown, contradictory, stale, duplicate, or mismatched evidence. Do not reroute, retry, or add fallback delivery.
6. Narrow definitive `FAILED` to explicit rejection classes already emitted by `FinalDeliveryRejectedError` (`permission`, `rate_limit`, `rejection`). Remove `transport`/`timeout` from caller-submittable and persisted definitive failure schemas; replace `complete.failed` timeout with a real rejection fixture and add owner recovery fixtures where timeout/transport ambiguity becomes terminal `DELIVERY_UNKNOWN`.
7. Extend the real cross-repository harness and test-only spool adapter to prove Discord and Slack root/child pairs inside 60 seconds create two records with distinct event/record IDs while retaining the same thread-history context; duplicate replay creates no third record. Add invoked timeout/transport, listener restart/lease expiry, contradictory replay, explicit proven `NOT_SENT`, duplicate evidence, and receipt mismatch scenarios, asserting provider call counts before and after restart.
8. Extend loader-backed Discord/Slack and Deliberation tests only to connect authenticated root/child facts to distinct intake responses and shared history identity. Keep ordinary channel debounce unchanged and avoid duplicating KM state policy in channel plugins.
9. Capture GREEN with the exact RED command, run focused contract/plugin/channel tests, the owner-listener integration, lint, build, and changed gates below, then run `skill:validate-implementation`. Run fresh repository autoreview as required by `AGENTS.md`; resolve all actionable findings.
10. Update `docs/plugins/reference/deliberation.md` and `extensions/deliberation/README.md` to describe one durable record per event, terminal unknown behavior, and the sole proof-backed requeue path. Do not change live config, allowlists, credentials, Gateway state, or rollout controls.
11. Submit `cd ~/Projects/openclaw-fork && npm test` to the caller-owned canonical Test Gate and record its concrete run reference; local output is not a substitute. Run `skill:save-learning` last.

## Files to Modify

| File                                                                                                                                | Change                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/km-wire-v1.json`                                                                                 | Mirror singular-record and closed retry/unknown schemas from the owner handoff                                |
| `extensions/deliberation/contracts/cutover-controls-v1.json`                                                                        | Add one-event, unknown, `NOT_SENT`, duplicate, replay, and exact-receipt fixtures; remove timeout-as-`FAILED` |
| `extensions/deliberation/contracts/provenance.json`                                                                                 | Pin the synchronized owner revision and regenerated artifact hashes                                           |
| `extensions/deliberation/src/contract.test.ts`                                                                                      | Assert no burst/multi-event authority and executable recovery semantics                                       |
| `extensions/deliberation/src/km-client.ts`                                                                                          | Parse pre-send authorization and reject contradictory attempt history before invocation                       |
| `extensions/deliberation/src/km-client.test.ts`                                                                                     | Cover unknown fencing, proof-backed `NOT_SENT`, duplicates, immutable envelopes, and receipt mismatch         |
| `extensions/deliberation/src/final-adapter.ts`, `final-adapter.test.ts`                                                             | Enforce durable authorization before the sole provider call, including adapter recreation                     |
| `extensions/deliberation/src/delivery-composition.test.ts`                                                                          | Prove real Discord/Slack adapters remain one-attempt and fail closed on ambiguity                             |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`, `km-spool-probe.py`                                                    | Exercise singular durable intake and restart/recovery against isolated owner SQLite state                     |
| `extensions/deliberation/src/hooks.test.ts`                                                                                         | Preserve provider event identity and shared thread-history context across two intakes                         |
| `extensions/discord/src/monitor/message-handler.queue.test.ts`, `extensions/slack/src/monitor/message-handler.deliberation.test.ts` | Cover authenticated root/child event separation without changing ordinary debounce                            |
| `docs/plugins/reference/deliberation.md`, `extensions/deliberation/README.md`                                                       | Align documented durable intake and uncertainty/recovery guarantees                                           |
| `plans/checkpoints/warm-mist-6808.red-green-proof.md`                                                                               | Tool-generated authentic RED/GREEN evidence                                                                   |

## TDD

Implementace TDD cyklu dle skill:tdd.

**Primary test files:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`, `extensions/deliberation/src/contract.test.ts`, `extensions/deliberation/src/km-client.test.ts`, `extensions/deliberation/src/final-adapter.test.ts`, `extensions/deliberation/src/delivery-composition.test.ts`  
**Framework:** Node test for the real owner listener/SQLite path; Vitest through `pnpm test` for local contract/runtime composition  
**Edit hint:** Extend the existing listener test at `extensions/deliberation/scripts/km-listener.cross-repo.ts:476`; do not create a simulated durable store.

Initial executable RED skeleton using imports and helpers already present in `km-listener.cross-repo.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { runIntakeProducer } from "./intake-producer.js";

function createIntegrationIntakeInput(endpoint: string, messageId: string) {
  return {
    endpoint,
    pipelines: [
      {
        id: "slack-source",
        source: { channel: "slack", accountId: "workspace-a", target: "C123" },
      },
    ],
    processingSource: { channel: "discord", accountId: "default", target: "processing" },
    event: {
      provider: "slack",
      eventType: "message",
      eventKind: "user_request",
      accountId: "workspace-a",
      conversationId: "C123",
      messageId,
      threadId: "1700000000.000100",
      senderId: "U1",
      timestamp: "2026-08-23T12:00:30.000Z",
      content: messageId,
    },
    context: {
      channelId: "slack",
      accountId: "workspace-a",
      conversationId: "C123",
      messageId,
      senderId: "U1",
    },
  } as const;
}

void test("keeps two same-window provider events as two durable items", async () => {
  const fixture = await createListenerFixture();
  try {
    const first = createIntegrationIntakeInput(fixture.context.endpoint, "1700000000.000200");
    const second = createIntegrationIntakeInput(fixture.context.endpoint, "1700000000.000300");
    const env = { OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential };

    await runIntakeProducer(first, env);
    await runIntakeProducer(second, env);

    const records = readSpool(fixture);
    assert.equal(records.length, 2); // RED: current KM burst stores one record.
    assert.equal(new Set(records.map((record) => record.recordId)).size, 2);
    assert.deepEqual(
      records.map((record) => record.sourceThreadId),
      [first.event.threadId, second.event.threadId],
    );
  } finally {
    await disposeFixture(fixture);
  }
});
```

Table-drive the test-only helper for Discord/Slack root/child cases before running RED, then add the full matrix:

| Test                                                        | RED                                                          | GREEN                                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Two Discord/Slack root or child events within 60 seconds    | Owner spool has one record with two messages                 | Two records/items, distinct event/record IDs, shared thread history only         |
| Duplicate provider evidence                                 | Replay mutates grouped record or creates ambiguous authority | Same event dedupes to its one record; no extra provider attempt                  |
| Timeout/transport after invocation                          | Fixture/runtime permits definitive `FAILED`                  | Durable state is `DELIVERY_UNKNOWN`; no failure completion or receipt            |
| Poll after lease expiry and listener/adapter restart        | Fresh reservation can cause provider call 2                  | Unknown is non-reservable and provider call count remains 1                      |
| Proven `NOT_SENT` reconciliation                            | Retry evidence is absent/unchecked                           | Fresh reservation is accepted only with exact durable proof and a new attempt ID |
| Unknown followed by `SENT` or duplicate attempt/provider ID | Parser accepts contradictory history                         | Parser rejects before invoke; no provider call                                   |
| Receipt mismatch                                            | Completion projection can drift from submitted receipt       | Exact one-message receipt mismatch fails closed without another send             |
| Immutable target across retry evidence                      | Historical attempts can carry another pipeline/target        | Every prior/current envelope matches admitted pipeline/source/target             |

With an approved compatible KM checkout exported as `OPENCLAW_DELIBERATION_KM_ROOT`, use the same command for authentic integration RED and GREEN:

```bash
TASK_ID=warm-mist-6808 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" red -- pnpm test:deliberation:km-integration
```

Replace `red` with `green` without changing the trailing command. Verify both proof sections before broader checks.

Focused verification after GREEN:

```bash
pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/hooks.test.ts extensions/discord/src/monitor/message-handler.queue.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts -- --reporter=verbose
pnpm test:deliberation:km-integration
pnpm lint:extensions -- extensions/deliberation extensions/discord extensions/slack
pnpm build
pnpm changed:lanes --json
pnpm check:changed
```

## Dependencies

- An owner-approved, contract-converged KM checkout is mandatory for exact retry-proof fields and authentic RED/GREEN. This planning session could not inspect the external checkout because workspace permissions denied access; do not proceed from the stale mirror alone.
- The implementation stays inside `openclaw-fork`; synchronized KM owner artifacts must arrive through the established contract/provenance handoff.
- Existing canonical `pipelines[]`, immutable effective target, one-message provider adapters, and exact receipt identity remain unchanged.
- Broad `pnpm check:changed` and the registered canonical Test Gate may require Testbox/caller infrastructure; record provider/run IDs or exact blockers.
- No live configuration, provider credentials, pilot activation, fallback delivery, or release work is included.
