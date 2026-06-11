# Investigation: Discord/session caller path and embedded-runner policy

Task: `quick-cove-4103`
Branch/commit inspected: `main` at `cfefa09329a3d446763b6f2ef55cce6b547182e9` (`.git/HEAD` + `.git/refs/heads/main`, read-only)

## Verdict

The requested production paths do not bypass embedded-runner incomplete-turn policy.

- Discord inbound messages enter the Discord plugin, then shared channel/auto-reply dispatch, then `runEmbeddedAgent`.
- Gateway `sessions.send` delegates to `chat.send`, then shared auto-reply dispatch, then `runEmbeddedAgent`.
- Neither path launches the raw `packages/agent-core` loop directly.
- `sessions.send` does not support `deliver`; the schema rejects extra fields and `handleSessionSend` never passes `deliver` to `chat.send`.

## Discord Inbound Call Chain

Normal Discord channel inbound message path:

1. `extensions/discord/src/monitor/provider.ts:526` constructs `discordProviderSessionRuntime.createDiscordMessageHandler(...)`.
2. `extensions/discord/src/monitor/provider.ts:557` registers monitor listeners with that handler.
3. `extensions/discord/src/monitor/listeners.ts:36` defines `DiscordMessageListener`; `handle(...)` fire-and-forgets `this.handler(data, client)` at `extensions/discord/src/monitor/listeners.ts:45`-`54`.
4. `extensions/discord/src/monitor/message-handler.ts:123` creates the handler. The handler claims replay and enqueues into the debouncer at `extensions/discord/src/monitor/message-handler.ts:309`-`341`.
5. Debouncer flush preflights the Discord message at `extensions/discord/src/monitor/message-handler.ts:201`-`225` or batched at `extensions/discord/src/monitor/message-handler.ts:258`-`294`, then enqueues `buildDiscordInboundJob(ctx, ...)`.
6. `extensions/discord/src/monitor/message-run-queue.ts:96` creates the per-session run queue; `enqueue(...)` runs `processDiscordQueuedMessage(...)` via `createChannelRunQueue` at `extensions/discord/src/monitor/message-run-queue.ts:130`-`150`.
7. `extensions/discord/src/monitor/message-run-queue.ts:46` loads and invokes `processDiscordMessage(materializeDiscordInboundJob(...))` at `extensions/discord/src/monitor/message-run-queue.ts:52`-`58`.
8. `extensions/discord/src/monitor/message-handler.process.ts:158` enters `processDiscordMessage`; `processDiscordMessageInner` builds the reply pipeline and calls `dispatchChannelInboundReply(...)` at `extensions/discord/src/monitor/message-handler.process.ts:943`-`963`.
9. `src/plugin-sdk/channel-inbound.ts:156`-`166` re-exports `dispatchChannelInboundReply` from `src/channels/message/inbound-reply-dispatch.ts`.
10. `src/channels/message/inbound-reply-dispatch.ts:125` delegates to the channel turn kernel.
11. `src/channels/turn/kernel.ts:354`-`437` records the inbound session and calls `params.dispatchReplyWithBufferedBlockDispatcher(...)` at `src/channels/turn/kernel.ts:381`-`431`.
12. `src/auto-reply/reply/provider-dispatcher.ts:17`-`27` calls `dispatchInboundMessageWithBufferedDispatcher(...)`.
13. `src/auto-reply/dispatch.ts:532`-`607` creates the dispatcher and calls `dispatchInboundMessage(...)`; `dispatchInboundMessage(...)` calls `dispatchReplyFromConfig(...)` at `src/auto-reply/dispatch.ts:507`-`520`.
14. `src/auto-reply/reply/get-reply-run.ts:1061`-`1063` loads `agent-runner.runtime`; `src/auto-reply/reply/get-reply-run.ts:1362`-`1402` calls `runReplyAgent(...)`.
15. `src/auto-reply/reply/agent-runner.runtime.ts:1`-`2` re-exports `runReplyAgent` from `agent-runner.ts`.
16. `src/auto-reply/reply/agent-runner-execution.ts:1964`-`2010` wraps the agent attempt in `runWithModelFallback(...)` and uses `buildAgentRuntimeOutcomePlan().classifyRunResult(...)`.
17. Non-CLI runtime calls `runEmbeddedAgent(...)` at `src/auto-reply/reply/agent-runner-execution.ts:2288`-`2363`.
18. Embedded-runner incomplete-turn handling is in `src/agents/embedded-agent-runner/run/incomplete-turn.ts`; fallback classification is wired by `src/agents/runtime-plan/build.ts:140`-`145` to `classifyEmbeddedAgentRunResultForModelFallback`.

Embedded-runner policy verdict: covered. Discord inbound uses embedded-runner via auto-reply and the shared channel kernel; it is not a raw `packages/agent-core` caller.

## Gateway `sessions.send` Call Chain

Mission Control/Gateway `sessions.send` path:

1. `src/gateway/server-methods/sessions.ts:1882`-`1893` registers `sessions.send` and calls `handleSessionSend(...)`.
2. `src/gateway/server-methods/sessions.ts:756`-`821` validates params, resolves the session key/agent, and creates an agent main session when needed.
3. `src/gateway/server-methods/sessions.ts:847`-`907` delegates to `chatHandlers["chat.send"](...)` with `sessionKey`, `message`, `thinking`, `attachments`, `timeoutMs`, and `idempotencyKey`. It does not pass `deliver`.
4. `src/gateway/server-methods/chat.ts:2949` enters `chat.send`.
5. `src/gateway/server-methods/chat.ts:3212`-`3220` resolves the originating route. Because `sessions.send` did not pass `deliver`, `resolveChatSendOriginatingRoute(...)` returns internal routing at `src/gateway/server-methods/chat.ts:1056`-`1061`.
6. `src/gateway/server-methods/chat.ts:3479`-`3520` builds the `MsgContext` with `Provider`/`Surface` as `INTERNAL_MESSAGE_CHANNEL` and any resolved `OriginatingChannel`/`OriginatingTo`.
7. `src/gateway/server-methods/chat.ts:3692`-`3720` creates a live reply dispatcher that buffers delivered final/block payloads for Gateway/webchat broadcast.
8. `src/gateway/server-methods/chat.ts:3756`-`3844` calls `dispatchInboundMessage(...)` with that dispatcher and reply options.
9. From `dispatchInboundMessage(...)`, the path is the same auto-reply path as above: `src/auto-reply/dispatch.ts:507`-`520` -> `dispatchReplyFromConfig(...)` -> `src/auto-reply/reply/get-reply-run.ts:1362`-`1402` -> `runReplyAgent(...)` -> `src/auto-reply/reply/agent-runner-execution.ts:2288`-`2363` -> `runEmbeddedAgent(...)`.
10. Post-dispatch, Gateway broadcasts the final UI event and avoids duplicating normal embedded-agent assistant turns because the runtime `SessionManager` owns persistence: `src/gateway/server-methods/chat.ts:3889`-`3895`; final broadcast paths start at `src/gateway/server-methods/chat.ts:4089` and `src/gateway/server-methods/chat.ts:4097`.

Embedded-runner policy verdict: covered. `sessions.send` does not bypass embedded-runner policy; it is a thin wrapper over `chat.send`, and `chat.send` uses auto-reply/embedded-runner dispatch.

## Promise-Only Final Text Risk

Neither requested path can produce promise-only final assistant text through raw `packages/agent-core` semantics, based on the inspected call chains.

Evidence:

- The Discord path reaches `runEmbeddedAgent(...)`, not `packages/agent-core` directly.
- The `sessions.send` path reaches `runEmbeddedAgent(...)`, not `packages/agent-core` directly.
- Embedded fallback classification explicitly treats empty, reasoning-only, planning-only, and incomplete terminal outcomes as malformed when there is no visible delivery evidence: `src/agents/embedded-agent-runner/result-fallback-classifier.ts:40`-`67` and `src/agents/embedded-agent-runner/result-fallback-classifier.ts:88`-`188`.

Remaining likely cause if the observed Discord/Mission Control behavior still reproduces: delivery contract mismatch, not raw agent-core caller coverage. `sessions.send` launches an internal Gateway/chat turn and returns/broadcasts Gateway session output; it does not ask OpenClaw to deliver the final answer to Discord.

Smallest safe follow-up task:

- Add/confirm a test that `sessions.send` rejects a `deliver` field through `SessionsSendParamsSchema`, and document/route Mission Control Ask Jackie to use the intended delivery path instead of assuming `sessions.send` delivers to Discord.
- If Mission Control needs an explicit Discord confirmation, add a product-level API/design task for an explicit delivery-capable dispatch contract; do not overload `sessions.send` silently.

## Final Confirmation Delivery Contract

`sessions.send` does not support `deliver`.

Evidence:

- `packages/gateway-protocol/src/schema/sessions.ts:164`-`175` defines `SessionsSendParamsSchema` with `additionalProperties: false` and no `deliver` field.
- `src/gateway/server-methods/sessions.ts:858`-`868` forwards only `sessionKey`, optional `agentId`, `message`, `thinking`, `attachments`, `timeoutMs`, and `idempotencyKey` to `chat.send`.
- `src/gateway/server-methods/chat.ts:1036`-`1148` supports `deliver` for `chat.send`, but `sessions.send` never sets it.

Therefore Mission Control cannot rely on `sessions.send` to post the final result back to Discord. Either:

- the turn must originate through the Discord channel session/inbound path so the Discord channel owns final delivery, or
- Mission Control must use/add an explicit delivery-capable contract and intentionally post/route the final confirmation.

## Test Evidence

Existing relevant tests:

- Discord handler/run queue path: `extensions/discord/src/monitor/message-handler.queue.test.ts:464`-`503` proves inbound duplicate/retry behavior reaches the queued worker only once/retries correctly.
- Discord process dispatch path: `extensions/discord/src/monitor/message-handler.process.test.ts:560`-`607` captures `dispatchInboundMessage(...)` calls from `processDiscordMessage(...)`; session routing coverage starts at `extensions/discord/src/monitor/message-handler.process.test.ts:1243`.
- Gateway `sessions.send`: `src/gateway/server.chat.gateway-server-chat.test.ts:225`-`276` proves `sessions.send` accepts existing sessions and creates configured agent main sessions before delegating.
- Embedded incomplete-turn policy: `src/agents/embedded-agent-runner/run.incomplete-turn.test.ts:1028`-`1092` covers exhausted empty-response and reasoning-only retries.
- Fallback classification: `src/auto-reply/reply/agent-runner-execution.test.ts:3192`-`3349` covers planning-only classification and delivery-evidence exemptions.

Missing minimal test:

- A focused Gateway protocol/handler test that `sessions.send` rejects `{ deliver: true }` and that `handleSessionSend` invokes `chat.send` without a `deliver` field. This locks the contract that MC cannot use `sessions.send` for Discord final delivery.
