# Plan 2026-08-14: Deliberation Delivery Target Cross-Repository Integration Coverage

Extend the existing guarded listener test so the real isolated KM spool reaches reviewed readiness and the OpenClaw final adapter completes delivery through a captured provider.

## Analysis

- `extensions/deliberation/scripts/km-listener.cross-repo.ts` already owns the temporary credential/spool, loopback listener, production-path guards, lifecycle cleanup, and seam-labeled assertions. Its current scenario stops after intake/deduplication in `DEBOUNCING`.
- `extensions/deliberation/scripts/km-spool-probe.py` is the guarded test-only bridge to the KM spool public API. Every command validates sentinel, containment, and production-root non-overlap before constructing `DeliberationSpool`.
- `extensions/deliberation/scripts/intake-producer.ts` exercises the real plugin config, inbound claim, serializer, and KM client, but its input currently cannot pass the optional operator `deliveryTarget`.
- `extensions/deliberation/src/km-client.ts` already implements configured-target injection and the real `ready -> reserve -> invoke -> completeDelivery` listener protocol. `extensions/deliberation/src/final-adapter.ts` sends once to the durable `deliveryTarget` and reuses it for invocation/completion evidence.
- `extensions/deliberation/contracts/km-wire-v1.json` is the accepted local authority: `sourceTarget` remains provenance, `deliveryTarget` is the effective durable route, and mismatched `attemptedTarget` must fail the invocation/completion fence.
- `extensions/deliberation/README.md` already documents isolation and cleanup. Add only a concise behavior note if the command now promises final-delivery coverage.
- The external proposal was unavailable under the workspace boundary; no wire shape is inferred from it.

## Knowledge Base

- `learnings/architecture/cross-repository-spool-tests-guard-every-constructor.md`: preserve validation before every spool constructor and terminate/await the listener before deleting temporary state.
- `learnings/architecture/2026-08-14_keep-operator-routing-out-of-intake-payloads.md`: inject only parsed operator config at the KM client boundary; delivery must consume the reserved target.
- `learnings/architecture/calm-crag-8936-sync-required-envelope-fields.md`: assert the effective target across ready, reservation, invocation, completion, and record projections.
- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`: KM owns fencing and terminal state; the injected provider owns exactly one non-durable send.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable. Older account-less source-target learnings are superseded by the accepted `v1:<provider>:<account>:<channel>` contract.

## Approach

Keep one `node:test` harness and one guarded Python probe. Add a probe operation that advances an isolated intake record through KM's existing public test/transition API to a reviewed `READY_TO_SEND` fixture; do not query SQLite, reproduce KM transition logic, or modify `km-system`. Then run the actual OpenClaw KM client and final adapter against the listener with a fake provider that records exact calls.

If the configured KM checkout exposes no public isolated fixture/transition API capable of producing a reviewed ready record, stop with that exact missing seam instead of adding raw-SQL or guessed state mutation.

## Implementation

1. Use `skill:tdd` to add the default-route RED below and record the failing command/output in `plans/checkpoints/quick-crag-3748.red-green-proof.md` before implementing the new probe operation.
2. Extend `km-spool-probe.py` with one closed, deterministic `prepare-ready` command using the KM spool's existing public fixture/transition API. Reuse `isolated_spool_root()` before construction, accept only fixed/bounded test inputs, and return the resulting canonical record projection as sorted JSON.
3. Extend `intake-producer.ts` input routes with optional `deliveryTarget`; map it into `parseDeliberationConfig` only. Keep caller event data unable to select a target, and preserve source/processing route validation.
4. In `km-listener.cross-repo.ts`, add named constants for source A, processing source, override B, reviewed text, and unique event IDs. Build a small scenario helper around the existing fixture, producer, probe, real `createKmClient`, and `createFinalDeliveryAdapter`; do not duplicate listener startup or cleanup.
5. Table-drive default and override scenarios. For each, intake from A, prepare one reviewed ready record, run the adapter once, and assert one fake-provider call with exact `{ accountId, channelId, text, idempotencyKey }`: A when omitted, B when configured.
6. Re-read the canonical spool after completion and assert `record.sourceTarget`, source context/freshness provenance, and message identity remain A; processing source remains a distinct fixture route; ready/reservation envelope and delivery attempt use effective A or B; final state is `SENT`.
7. Add a separate override-fencing scenario: reserve a real B envelope, submit invocation and completion attempts with A or C, assert the listener rejects each with the canonical closed error, re-read the spool to prove no mismatched evidence persisted, and assert the fake provider was never called. Then use the valid B target on an independent record so successful invocation/completion evidence is also proven.
8. Retain the duplicate, malformed-body, production-spool, callback-failure, path-alias, and cleanup tests unchanged. Prefix new failures with `routing:`, `provider:`, `fence:`, `provenance:`, or existing seam labels so regressions identify the failed boundary.
9. Update `extensions/deliberation/README.md` only if needed to state that the command now covers default/override final routing with a fake provider and never sends to Discord.
10. Run focused and full verification, perform `skill:code-review` and `skill:validate-implementation`, record exact command/results in the final note, then invoke `skill:save-learning` as the implementation session's last action.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts` | Add table-driven real-listener delivery scenarios, fake-provider capture, provenance/fence assertions, and diagnostic labels. |
| `extensions/deliberation/scripts/km-spool-probe.py` | Add one guarded public-API operation to prepare/read a reviewed ready fixture. |
| `extensions/deliberation/scripts/intake-producer.ts` | Allow optional operator delivery route in harness config, never in caller event data. |
| `extensions/deliberation/scripts/intake-producer.test.ts` | Prove optional route parsing/forwarding if the helper schema changes. |
| `extensions/deliberation/README.md` | Optional concise command-behavior update. |
| `plans/checkpoints/quick-crag-3748.red-green-proof.md` | Record genuine RED/GREEN evidence. |

## TDD

Implement the cycle with `skill:tdd`.

**Test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Framework:** Node `node:test`  
**Run command:** `OPENCLAW_DELIBERATION_KM_ROOT=/absolute/path/to/km-system pnpm test:deliberation:km-integration`  
**Edit hint:** First widen `runProbe`'s command union to include `prepare-ready`, append this test, and leave the Python command unimplemented for RED.

```ts
import { parseDeliberationConfig } from "../src/config.js";
import { createFinalDeliveryAdapter } from "../src/final-adapter.js";
import { createKmClient } from "../src/km-client.js";

test("default delivery returns a reviewed source-A item to source A", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-08-09T08:33:00.123Z") });
  const fixture = await createListenerFixture();
  const source = { provider: "discord", accountId: "account-a", channelId: "channel-a" } as const;
  const processing = {
    provider: "discord",
    accountId: "processing-account",
    channelId: "processing-channel",
  } as const;
  const env = { OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential };
  try {
    await runIntakeProducer(
      {
        endpoint: fixture.context.endpoint,
        routes: { sources: [source], processing },
        event: {
          provider: "discord",
          eventType: "message",
          eventKind: "user_request",
          channelId: source.channelId,
          accountId: source.accountId,
          messageId: "default-route-message",
          senderId: "sender-1",
          timestamp: OCCURRED_AT,
          content: "default route intake",
        },
      },
      env,
    );
    runProbe(
      path.join(fixture.context.kmRoot, ".venv/bin/python3"),
      fixture.context.kmRoot,
      fixture.tempRoot,
      fixture.context.spoolRoot,
      "prepare-ready",
    );
    const config = parseDeliberationConfig({
      enabled: true,
      failClosed: true,
      sources: [{ channel: "discord", accountId: source.accountId, target: source.channelId }],
      processingSource: {
        channel: "discord",
        accountId: processing.accountId,
        target: processing.channelId,
      },
      km: {
        endpoint: fixture.context.endpoint,
        credential: fixture.context.credential,
        requestTimeoutMs: 5_000,
      },
      restrictedSessionKeys: ["integration-reviewer"],
    });
    const km = createKmClient({ config, openclawConfig: {} as never, env });
    const calls: Array<{ accountId: string; channelId: string; text: string }> = [];
    await createFinalDeliveryAdapter({
      km,
      owner: "integration-sender",
      provider: {
        send: async ({ accountId, channelId, text }) => {
          calls.push({ accountId, channelId, text });
          return { receiptId: "receipt-default", messageId: "provider-default" };
        },
      },
    }).runOnce();

    assert.deepEqual(calls, [
      { accountId: "account-a", channelId: "channel-a", text: "reviewed default route" },
    ]);
  } finally {
    t.mock.timers.reset();
    await disposeFixture(fixture);
  }
});
```

| Case | RED | GREEN |
| --- | --- | --- |
| Default route | Probe rejects unknown `prepare-ready`; no final call occurs. | Real ready/reserve/invoke/complete sends reviewed text once to A. |
| Override route | Harness cannot configure or prove B. | Intake from A persists B and fake provider receives exactly one B call. |
| Provenance | No post-delivery projection is asserted. | Source/freshness remains A while processing and delivery identities stay distinct. |
| Durable fence | No real listener mismatch is attempted. | A/C mismatch is rejected without provider call or persisted mismatched evidence; valid evidence records B. |

## Verification

1. `OPENCLAW_DELIBERATION_KM_ROOT=/absolute/path/to/km-system pnpm test:deliberation:km-integration`
2. `pnpm test extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
3. `pnpm test extensions/deliberation -- --reporter=verbose`
4. `pnpm tsgo:extensions && pnpm tsgo:extensions:test`
5. `git diff --check`

Record exit status, test counts, and the explicit statement that every outbound call was captured by the fake provider and no real Discord delivery occurred.

## Available Skills

- `tdd`: RED/GREEN workflow and proof artifact.
- `recall-knowledge`: project learning lookup.
- `code-review`: focused pre-handoff review.
- `validate-implementation`: acceptance and boundary validation.
- `save-learning`: mandatory final implementation-session action.

---
*Status: DRAFT*
