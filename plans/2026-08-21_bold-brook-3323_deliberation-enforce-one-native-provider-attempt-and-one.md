# Plan 2026-08-21: Deliberation single-attempt delivery

Task ID: `bold-brook-3323`  
Source task: `plans/tasks/2026-08-21_deliberation-enforce-one-native-provider-attempt-and-one-mes.md`

## Analysis

- `extensions/deliberation/src/final-adapter.ts:168-227` persists `provider:${attemptId}` before one provider callback, but `extensions/deliberation/index.ts:40-127` drops that key and calls ordinary channel sends.
- `src/channels/plugins/outbound.types.ts:149-238` has no operation whose contract forbids retry, fallback, or rechunking. Add one optional operation rather than changing ordinary `sendText` semantics.
- Discord retries at both `extensions/discord/src/outbound-adapter.ts:232-247` and `extensions/discord/src/client.ts:128-139`, falls back from webhook to bot at `extensions/discord/src/outbound-adapter.ts:219-232`, and rewrites mentions after Deliberation's current preflight at `extensions/discord/src/send.outbound.ts:179-197`.
- Slack retries DNS failures at `extensions/slack/src/send.ts:280-361` and renders/rechunks into multiple `chat.postMessage` calls at `extensions/slack/src/send.ts:752-840`; its write client already disables SDK retries in `extensions/slack/src/client-options.ts:14-16`.
- Discord bot message creation supports `nonce` and `enforce_nonce` (`node_modules/discord-api-types/rest/v10/channel.d.ts:232-287`; [Discord Create Message](https://discord.com/developers/docs/resources/message#create-message)). Slack's installed and public `chat.postMessage` request contracts expose no accepted idempotency argument (`node_modules/@slack/web-api/dist/types/request/chat.d.ts:169-172`; [Slack chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage)).
- `learnings/architecture/quick-wave-9858-audit-abstraction-and-fixture-boundaries.md` requires separate assertions for feature calls, adapter calls, and native API attempts; mocked Deliberation providers alone are insufficient.

## Available Skills

- `tdd`: create the composition RED first and record RED/GREEN evidence.
- `openclaw-testing`: choose focused extension tests, changed typecheck/lint gates, and build proof.
- `autoreview`: run the mandatory fresh implementation review before closeout.
- `validate-implementation`: verify the final SDK ownership and docs alignment.

## Approach

Add an optional `sendTextAttempt` operation to `ChannelOutboundAdapter`. Its contract must render the final provider payload once, reject before any message-create request unless it is exactly one platform message, make at most one native message-create request, prohibit fallback/retry/rechunking, and return a closed `sent | rejected | unknown` result with exactly one receipt plus `idempotency: "native" | "unsupported"`.

Deliberation will require this operation and pass the durable `idempotencyKey`. Provider plugins remain responsible for rendering, transport classification, and native idempotency. Ordinary `sendText`, webhook fallback, retry, and chunking paths remain unchanged.

## Implementation

1. Add `ChannelOutboundTextAttemptContext`, `ChannelOutboundTextAttemptResult`, and optional `sendTextAttempt` to the outbound SDK contract. Document that `rejected` means no native acceptance is possible, while timeout/request failures after dispatch are `unknown`; the operation must never retry an unknown outcome.
2. Replace both Deliberation wrappers' `sendText` calls with `sendTextAttempt`. Pass `provider:${reservation.attemptId}` unchanged, include Discord `sourceMessageId` for `source_anchor`, require one receipt/message ID, map `rejected` to the existing failure completion, and map `unknown` or malformed/multi-part success evidence to `FinalDeliveryOutcomeUnknownError` without another send. Fail closed when an adapter lacks the capability.
3. Implement Discord's operation separately from ordinary delivery. Select webhook versus bot once, apply the route's table/mention representation once, reject if it does not produce exactly one <=2,000-character payload, and invoke that selected route once. Do not call `withDiscordDeliveryRetry`, configure the inner request runner for one attempt, and never catch a webhook failure to send through the bot path. Add the unchanged durable key as bot `nonce` with `enforce_nonce: true`; report webhook idempotency as `unsupported`. For `source_anchor`, retain create-or-recover target-thread resolution but permit only one subsequent message-create call.
4. Implement Slack's operation through the channel's lazy send runtime. Reuse the effective account limit and mrkdwn conversion, reject unless rendering yields one chunk, then call `chat.postMessage` directly once without `withSlackDnsRequestRetry`, identity fallback, or a chunk loop. Report idempotency as `unsupported` instead of discarding the key; classify Web API rejection as `rejected` and request/timeout ambiguity as `unknown`.
5. Add a Deliberation composition suite that injects the real `discordPlugin.outbound` and `slackPlugin.outbound` objects from their public plugin APIs, mocking only KM and native HTTP/SDK boundaries. Assert the same provider-attempt key reaches Discord's native payload or an explicit unsupported result, and count native requests for timeout, accepted-then-error, webhook failure, rendered over-limit input, and attempted multi-part evidence.
6. Extend existing provider tests to prove ordinary non-Deliberation sends still retry, fall back, and rechunk exactly as before. Update Deliberation and outbound SDK docs; do not alter KM schemas, fixtures, config, or ordinary channel defaults.

## Files to Modify

| File                                                       | Change                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/channels/plugins/outbound.types.ts`                   | Add the closed single-text-attempt context, result, and optional adapter operation.                          |
| `src/channels/plugins/types.adapters.ts`                   | Re-export the new public adapter types.                                                                      |
| `src/plugin-sdk/channel-contract.ts`                       | Expose the new types through the existing SDK contract.                                                      |
| `src/plugin-sdk/channel-send-result.ts`                    | Re-export the attempt types alongside `ChannelOutboundAdapter`.                                              |
| `extensions/deliberation/index.ts`                         | Require and consume `sendTextAttempt`, forward the key, validate one receipt, and preserve unknown outcomes. |
| `extensions/deliberation/src/final-adapter.test.ts`        | Lock unknown/rejected completion behavior under one provider-attempt identity.                               |
| `extensions/deliberation/src/plugin.test.ts`               | Replace mocked ordinary-send expectations with the new capability contract.                                  |
| `extensions/deliberation/src/delivery-composition.test.ts` | Add real Discord/Slack adapter composition and native-call-count coverage.                                   |
| `extensions/discord/src/outbound-adapter.ts`               | Implement the no-retry/no-fallback single-attempt operation.                                                 |
| `extensions/discord/src/send.outbound.ts`                  | Reuse exact Discord text rendering for a one-message bot attempt.                                            |
| `extensions/discord/src/send.shared.ts`                    | Permit one prepared message body and one native create call without chunk iteration.                         |
| `extensions/discord/src/send.message-request.ts`           | Carry bot `nonce` and `enforce_nonce`.                                                                       |
| `extensions/discord/src/send.webhook.ts`                   | Support one already-prepared webhook payload without a second mention rewrite.                               |
| `extensions/discord/src/outbound-adapter.test.ts`          | Prove one attempt, no webhook fallback, and ordinary-path preservation.                                      |
| `extensions/discord/src/send.message-request.test.ts`      | Prove exact Discord native idempotency fields.                                                               |
| `extensions/slack/src/channel.ts`                          | Expose the Slack single-attempt operation through the loaded adapter.                                        |
| `extensions/slack/src/send.ts`                             | Extract render-once preparation and add one direct no-retry `chat.postMessage` path.                         |
| `extensions/slack/src/send.runtime.ts`                     | Lazily export the new Slack send primitive.                                                                  |
| `extensions/slack/src/channel.test.ts`                     | Prove capability wiring and key-support evidence.                                                            |
| `extensions/slack/src/send.blocks.test.ts`                 | Prove rendered-limit rejection, one request, no DNS retry, and ordinary rechunk preservation.                |
| `docs/plugins/sdk-channel-outbound.md`                     | Document the operation's strict semantics and result states.                                                 |
| `docs/plugins/reference/deliberation.md`                   | Document final-render preflight, one native attempt, idempotency support, and unknown outcomes.              |

## TDD

Implement the cycle with `skill:tdd`; record evidence in `plans/checkpoints/bold-brook-3323.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/delivery-composition.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`  
**Edit hint:** New file; start by locking the missing real-adapter capability, then expand the same suite through Deliberation with native boundary spies.

```ts
import { discordPlugin } from "@openclaw/discord/api.js";
import { slackPlugin } from "@openclaw/slack/api.js";
import type { ChannelOutboundAdapter } from "openclaw/plugin-sdk/channel-send-result";
import { describe, expect, it } from "vitest";

describe("Deliberation native adapter composition", () => {
  it.each([
    ["discord", discordPlugin.outbound],
    ["slack", slackPlugin.outbound],
  ])("requires the real %s adapter single-attempt capability", (_provider, outbound) => {
    const adapter: ChannelOutboundAdapter | undefined = outbound;

    // RED: neither real adapter exposes the required operation yet.
    expect(adapter?.sendTextAttempt).toEqual(expect.any(Function));
  });
});
```

| Test                                   | RED                                                     | GREEN                                                             |
| -------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| Real adapter capability                | `sendTextAttempt` is `undefined` for Discord and Slack. | Both real loaded adapters expose the strict operation.            |
| Discord timeout/accepted-then-error    | Current ordinary path retries or can fall back.         | One native request, no bot fallback, outcome `unknown`.           |
| Discord rendered over-limit            | Raw preflight misses mention expansion.                 | Zero native requests after final mention rendering exceeds 2,000. |
| Slack DNS/accepted-then-error          | Current sender retries DNS failures.                    | One `chat.postMessage`, outcome `unknown`, no retry.              |
| Slack rendered over-limit/partial path | Current sender posts every rendered chunk.              | Zero native requests when rendering yields multiple chunks.       |
| Ordinary outbound regression           | Existing tests encode retry/fallback/rechunk behavior.  | Existing ordinary-path assertions remain green unchanged.         |

## Verification

1. `pnpm test extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/discord/src/outbound-adapter.test.ts extensions/discord/src/send.message-request.test.ts extensions/slack/src/channel.test.ts extensions/slack/src/send.blocks.test.ts -- --reporter=verbose`
2. `pnpm test extensions/deliberation extensions/discord extensions/slack`
3. `pnpm tsgo:extensions`
4. `pnpm tsgo:extensions:test`
5. `pnpm check:docs`
6. `pnpm build`
7. `pnpm check:changed`
8. Run `skill:validate-implementation`, then fresh `skill:autoreview` until no accepted actionable findings remain.

_Status: DRAFT_
