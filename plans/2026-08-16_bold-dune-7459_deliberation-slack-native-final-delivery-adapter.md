# Plan 2026-08-16: Deliberation Slack-native final delivery adapter

Add dormant Slack destination support without changing KM lifecycle ownership, Discord behavior, or live routes.

*Status: DRAFT - contract gate required*

## Progress

- [x] Phase 0: initialize canonical plan file
- [x] Phase 1: research proposal evidence, prior sequence evidence, and code paths
- [x] Phase 2: load relevant learnings
- [x] Phase 3: synthesize implementation and verification steps

## Analysis

### Codebase Context

- `extensions/deliberation/src/final-adapter.ts` already selects an injected provider from the durable destination and preserves `ready -> reserve -> invoke -> one send -> complete` with exact target equality.
- `extensions/deliberation/index.ts` registers only Discord and fences Discord adapter fan-out to one unchanged chunk before sending.
- `extensions/slack/src/outbound-adapter.ts` is the correct cross-plugin seam: `sendText` forwards explicit `accountId`, maps a valid `threadId` to `threadTs`, and returns Slack receipt/message data.
- Slack currently drops an invalid thread timestamp and may chunk inside `sendMessageSlack`; both behaviors need fail-closed preflight before KM invocation.
- Slack SDK errors expose rate limits through `retryAfter`, HTTP status through `statusCode`, transport details through `original`, and platform codes through `data.error`. Enriched Slack errors currently discard those fields.

### Contract Gate

- `extensions/deliberation/contracts/km-wire-v1.json:94-103` still fixes `deliveryTarget.provider` to `discord`; its immutable provenance cannot be widened from OpenClaw assumptions.
- Before product edits, read the proposal's `slack-delivery` section and require repository-local KM-owner evidence that the same v1 target permits `slack` with exact field bounds and lifecycle equality semantics. If absent, record a checkpoint naming this fixture/provenance gap and stop.
- Do not edit accepted contract fixtures/provenance unless the KM owner supplies the replacement artifact or explicitly delegates that exact update.

### Knowledge Base

- `learnings/architecture/use-generic-outbound-runtime-adapter-for-cross-plugin-sends.md`: use `api.runtime.channel.outbound.loadAdapter`, never Slack private source.
- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`: KM owns durable state; Deliberation owns one bounded invocation; the channel plugin owns native routing and receipts.
- `learnings/architecture/deliberation-fence-channel-adapter-fanout.md`: preflight the exact rendered text as one platform message before invocation.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove dormant capability by config/registration paths, not by absence of live sends alone.
- Knowledge recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: record characterization-first RED/GREEN proof.
- `openclaw-testing`: choose repository-supported focused tests and tsgo lanes.
- `validate-implementation`: check contract, boundary, and rollout constraints.
- `autoreview`: run mandatory fresh review before handoff.
- `save-learning`: save the required implementation-session learning last.

## Implementation

1. Close the contract gate, then run the current Deliberation final-adapter/plugin tests and Slack outbound/send tests unchanged to characterize Discord lifecycle order, Slack explicit account routing, `threadId -> threadTs`, receipts, and existing helper-owned retry behavior.
2. Use `skill:tdd` to add failing Slack-destination cases before production edits: Slack -> Slack, Discord -> Slack, same channel/different thread, explicit account, receipt binding, provider isolation, unsupported provider, target mismatch, and zero send before invocation.
3. Change `delivery-target.ts` to an exact discriminated union for `discord | slack`. Reuse canonical account/channel bounds; require Slack `threadId` to be a valid timestamp so an explicit invalid target fails before reservation instead of being silently dropped. Align optional operator config and `openclaw.plugin.json` without adding a configured value or default.
4. Register a lazy Slack provider beside Discord through `api.runtime.channel.outbound.loadAdapter("slack")`. Pass `cfg`, exact `accountId`, `to: channel:<channelId>`, exact `threadId`, and text; derive bounded receipt/message IDs from the returned channel receipt and reject empty/sentinel IDs.
5. Give the Slack outbound adapter a pure chunk preflight that matches its rendered mrkdwn chunks. Forward explicit formatting into `sendMessageSlack`, and let its current config behavior remain unchanged when no override is provided. Deliberation must require exactly one unchanged rendered chunk before `km.invoke`; oversized/expanding text completes as rejection without any Slack API call.
6. Preserve structured Slack error facts when `send.ts` enriches an error, then extend Deliberation's bounded classifier to inspect only the error/cause chain. Map `missing_scope` and auth failures to `permission`; inaccessible/deleted/not-in-channel and other platform rejection codes to `rejection`; SDK rate limit/HTTP 429 to `rate_limit`; request/network failures to `transport`; timeout/abort evidence to `timeout`. Emit only redacted, length-bounded `code`, `status`, `retryAfterSeconds`, and `detail` fields.
7. Keep one call to the selected outbound adapter after durable invocation. Do not add Deliberation retries; retain Slack helper-owned transport behavior and prove Slack destinations never load/call Discord and Discord destinations never load/call Slack.
8. Extend `km-client.test.ts` only after owner contract evidence allows Slack, proving exact Slack target equality in ready/reservation/invocation/completion and bounded receipt/failure evidence. Keep `km-client.ts` unchanged unless its current generic target typing cannot carry the validated union.
9. Strengthen `sole-send.test.ts` to inventory the new registration path while retaining one Deliberation service/final adapter as the only durable-send owner. Verify no live config, pilot route, scopes, permissions, or KM files changed.
10. Update the Deliberation reference page only to document the accepted dormant destination shape and explicitly state that rollout requires operator configuration; do not claim Slack-native delivery is enabled.
11. Run focused verification, `skill:validate-implementation`, and fresh `skill:autoreview`; resolve accepted findings before handoff. Run `skill:save-learning` last.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/src/delivery-target.ts` | Add strict owner-authorized Slack destination validation. |
| `extensions/deliberation/src/config.test.ts`, `extensions/deliberation/openclaw.plugin.json` | Align dormant optional Slack destination config without defaults/routes. |
| `extensions/deliberation/src/final-adapter.ts` | Preserve lifecycle and add bounded Slack-aware failure extraction only if needed. |
| `extensions/deliberation/index.ts` | Register lazy Slack and Discord providers through generic outbound adapters. |
| `extensions/deliberation/src/final-adapter.test.ts` | Prove destination dispatch, lifecycle order, target fencing, isolation, receipts, and failure classes. |
| `extensions/deliberation/src/plugin.test.ts` | Prove exact Slack account/channel/thread calls and unchanged Discord behavior. |
| `extensions/deliberation/src/km-client.test.ts` | Prove Slack target/evidence round trips after the contract gate closes. |
| `extensions/deliberation/src/sole-send.test.ts` | Retain one durable sender across both providers. |
| `extensions/slack/src/outbound-adapter.ts`, `extensions/slack/src/outbound-adapter.test.ts` | Expose matching one-message preflight and forward explicit formatting/thread/account values. |
| `extensions/slack/src/send.ts`, focused send/error test | Preserve structured error cause and prove one exact threaded post under explicit formatting. |
| `docs/plugins/reference/deliberation.md` | Document dormant, operator-controlled Slack destination support if the contract is accepted. |

## TDD

Implement the cycle with `skill:tdd`; record evidence in `plans/checkpoints/bold-dune-7459.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`

Append after the current Discord characterization:

```ts
it("routes a Discord-origin result once to the exact Slack thread", async () => {
  const target = {
    provider: "slack" as const,
    accountId: "workspace-a",
    channelId: "C123",
    threadId: "1770000000.000001",
  };
  const events: string[] = [];
  const slack = {
    send: vi.fn(async () => {
      events.push("send:slack");
      return { receiptId: "1770000001.000002", messageId: "1770000001.000002" };
    }),
  };
  const discord = { send: vi.fn() };
  const km = {
    ready: vi.fn().mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
    }),
    reserve: vi.fn(async () => {
      events.push("reserve");
      return {
        outcome: "reserved" as const,
        reservation: {
          ...reservation,
          deliveryEnvelope: {
            sourceTarget: "v1:discord:source-account:source-channel",
            deliveryTarget: target,
          },
        },
      };
    }),
    invoke: vi.fn(async () => events.push("invoke")),
    completeDelivery: vi.fn(async () => {
      events.push("complete");
      return { state: "SENT" };
    }),
  };

  await createFinalDeliveryAdapter({
    km,
    providers: { discord, slack },
    owner: "owner",
  } as never).runOnce();

  expect(events).toEqual(["reserve", "invoke", "send:slack", "complete"]);
  expect(slack.send).toHaveBeenCalledWith({
    ...target,
    text: "reply",
    idempotencyKey: "provider:attempt-1",
  });
  expect(discord.send).not.toHaveBeenCalled();
});
```

| Test | RED before implementation | GREEN after implementation |
| --- | --- | --- |
| Discord source -> Slack destination | Strict target parser rejects `provider: slack`. | Exact lifecycle and one Slack call pass. |
| Slack source -> Slack destination | Slack target is unsupported. | Selection depends only on destination provider. |
| Same channel, different thread/account | No Slack provider exists. | Exact account and `thread_ts` reach one Slack post. |
| Failure/receipt binding | Slack structured facts are unavailable. | Bounded class/evidence or receipt IDs reach KM completion. |
| Cross-provider sole send | Only Discord is registered. | Exactly one selected provider is called. |

## Verification

1. `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/config.test.ts extensions/deliberation/src/sole-send.test.ts extensions/slack/src/outbound-adapter.test.ts extensions/slack/src/send.blocks.test.ts`
2. `pnpm tsgo:extensions && pnpm tsgo:extensions:test`
3. `pnpm lint:extensions -- extensions/deliberation extensions/slack`
4. `pnpm format:check -- extensions/deliberation extensions/slack/src/outbound-adapter.ts extensions/slack/src/send.ts docs/plugins/reference/deliberation.md`
5. `pnpm build`
6. `git diff --check`

Use repository wrappers rather than the task's raw Vitest/Prettier examples. All provider calls remain mocked; do not send real messages.

## Dependencies

- KM-owner evidence must authorize Slack in the immutable v1 delivery target before implementation.
- Slack remains installed/configured independently; this task adds no dependency, scope, permission, route, default, or live activation.
- The proposal file was inaccessible to this planning session due external-directory tool policy; the implementer must complete that required reading after access is granted.
