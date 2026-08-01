# Deliberation v2 standard plugin capability investigation

Task: `wild-peak-6037`  
Downstream task: `bright-wave-6041`  
Source snapshot: `0b4e3efe73310486990a24f0e9a981a2979548ea` on `sync/stable-2026.6.5-20260611-220612`  
Runtime used for verification: Node `v25.6.1`, pnpm `11.2.2`

## 1. Executive verdict

**Verdict: NO for the literal requirements.** A normal external plugin can implement most of the OpenClaw-facing adapter, but the current standard Plugin SDK cannot prove all three strict guarantees at once:

1. A message decision hook is not fail-closed when the handler throws, reaches a host timeout, or the plugin is absent. The global runner treats the relevant message hooks as fail-open (`src/plugins/hook-runner-global.ts:32-48`, `src/plugins/hooks.ts:295-315`, `src/plugins/hooks.ts:517-528`).
2. Outbound hooks have no host-authored sender/provenance capability. `message_sending` sees route and optional session correlation, but not a trusted plugin origin, delivery intent id, KM authorization id, or queue id (`src/plugins/hook-message.types.ts:114-127`, `src/infra/outbound/deliver.ts:1065-1111`). Raw channel adapters, plugin-owned message actions, polls, and native clients can bypass the hook (`src/plugins/runtime/types-channel.ts:179-181`, `src/infra/outbound/outbound-send-service.ts:126-182`, `src/infra/outbound/outbound-send-service.ts:334-383`).
3. OpenClaw cannot guarantee exactly-once visible delivery after an unknown provider outcome. The queue refuses blind replay, which prevents a known duplicate at the cost of possible non-delivery. No production channel in this checkout implements `reconcileUnknownSend`; only contracts and tests do. The native send context has no provider idempotency key (`src/channels/message/types.ts:168-217`, `src/channels/message/types.ts:257-289`, `src/infra/outbound/delivery-queue-recovery.ts:367-449`).

**Bounded recommendation:** `bright-wave-6041` can proceed as a standard plugin only if Michal accepts a narrower contract: fail closed while the plugin is loaded, cooperative isolation of model sessions rather than an in-process security boundary, and **one KM-reserved platform-send attempt with explicit `UNKNOWN` reconciliation**, not exactly-once visible delivery. Under that bounded contract the answer is **YES WITH LIMITATIONS**, no Deliberation-specific core code is needed, and KM remains the durable authority.

**Best fix judgment:** do not put Deliberation policy into core. First use `inbound_claim` as a non-claiming intake seam, `before_dispatch` as the terminal silent gate, `before_tool_call` plus `message_sending` as session isolation, `api.registerService` or a plugin-owned authenticated trigger for recovery, and `sendDurableMessageBatch` for final delivery. Add a generic core seam only if the strict fail-closed and sole-authorized-sender guarantees remain mandatory.

## 2. Requirement-to-capability matrix

Evidence labels used below:

- **Documented** means the public plugin docs describe the behavior.
- **Observed** means current source implements it, whether or not it is a stable public guarantee.
- **Tested** means a focused existing test characterizes it.
- **Gap** means the literal requirement cannot be guaranteed by a standard external plugin.

| Requirement                                 | Capability and evidence                                                                                                                                                                                                                                                                                                                                                                | Owner                   | Result                                                                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Observe configured generic sources          | `inbound_claim` exposes channel, account, resolved conversation, parent conversation, provider message id, session, thread, reply, sender, and timestamp (`src/plugins/hook-message.types.ts:58-93`, `src/hooks/message-hook-mappers.ts:308-391`).                                                                                                                                     | Plugin                  | YES                                                                                                                             |
| Claim/suppress source intake                | `inbound_claim` is sequential, priority ordered, and first `{ handled: true }` wins (`src/plugins/hooks.ts:272-289`, `src/plugins/hooks.ts:689-753`). Current broadcast claim suppresses model dispatch (`src/auto-reply/reply/dispatch-from-config.ts:1899-1924`).                                                                                                                    | Plugin/core             | YES WITH LIMITATIONS: current broadcast claim does not settle core dedupe and ignores `reply`.                                  |
| Exclude processing channel                  | The plugin can compare normalized `channelId`, `accountId`, `conversationId`, and `parentConversationId` against strict manifest config before intake or gating.                                                                                                                                                                                                                       | Plugin                  | YES                                                                                                                             |
| Fail-closed ordinary reply                  | `before_dispatch` runs before `reply_dispatch` and the default resolver; `{ handled: true }` with no `text` records a terminal silent outcome and commits inbound dedupe (`src/auto-reply/reply/dispatch-from-config.ts:2142-2191`).                                                                                                                                                   | Plugin/core             | YES while the hook runs; NO for hook error, host timeout, or absent plugin.                                                     |
| No user-forgeable text marker               | Plugin-private code and KM state can authorize the final adapter without putting a marker in message text. Existing outbound hook contexts, however, have no host-authored authorization field.                                                                                                                                                                                        | Plugin/KM               | YES for plugin-private call ownership; NO as a host-enforced global send capability.                                            |
| Exactly one authorized final delivery       | `sendDurableMessageBatch` is the supported durable API and returns explicit sent/suppressed/partial/failed outcomes plus receipts (`docs/plugins/sdk-channel-outbound.md:88-106`, `src/plugin-sdk/channel-outbound.ts:202-232`, `src/channels/message/send.ts:75-105`).                                                                                                                | Plugin/KM/core/provider | NO as written. KM can guarantee one reserved attempt; provider-visible exactly once is unproved.                                |
| Correlation                                 | Inbound hooks expose provider message, session, thread, reply and sender fields. Outbound hooks preserve optional canonical `sessionKey`; receipts return platform ids where adapters provide them (`src/plugins/hook-message.types.ts:5-56`, `src/channels/message/types.ts:49-94`).                                                                                                  | Plugin/core/provider    | YES WITH LIMITATIONS: inbound `runId` is currently not populated and outbound standard hooks omit it.                           |
| Duplicate provider delivery                 | Discord has a five-minute process-local replay guard and core has a twenty-minute process-local dedupe (`extensions/discord/src/monitor/inbound-dedupe.ts:6-13`, `src/auto-reply/reply/inbound-dedupe.ts:14-31`). The public persistent dedupe helper can add restart-safe bounded dedupe (`src/plugin-sdk/persistent-dedupe.ts:1-10`, `src/plugin-sdk/persistent-dedupe.ts:347-488`). | Plugin/KM/core          | YES WITH LIMITATIONS: KM must own the canonical permanent event key.                                                            |
| Duplicate worker attempt                    | Each `sendDurableMessageBatch` call creates a new random queue id (`src/infra/outbound/delivery-queue-storage.ts:95-130`). The queue only joins duplicate work for the same queue id.                                                                                                                                                                                                  | KM                      | NO from OpenClaw alone; KM needs atomic reservation/CAS.                                                                        |
| Retry and restart without visible duplicate | The queue persists the send before delivery and refuses to blindly replay after platform send may have started (`src/infra/outbound/deliver.ts:1257-1308`, `src/infra/outbound/delivery-queue-recovery.ts:367-449`).                                                                                                                                                                   | Core/provider/KM        | At-most-one blind attempt, not exactly-once completion. Unknown outcomes can remain unsent or unresolved.                       |
| Draft/reviewer sessions cannot send         | `before_tool_call` has fail-closed host policy and can block the `message` tool by host session context. `message_sending` can cancel canonical deliveries by session key (`src/plugins/hook-types.ts:508-545`, `src/plugins/hook-runner-global.ts:43-47`, `src/plugins/hooks.ts:1160-1188`).                                                                                          | Plugin                  | YES for cooperative model/tool paths; NO as an in-process security boundary because alternate plugin/native paths bypass hooks. |
| Channel-neutral design, Discord pilot       | Hook and durable-send contracts are generic. Discord provides the necessary ids and core reply path. WhatsApp has an additional documented privacy opt-in for `message_received` (`docs/channels/whatsapp.md:210-248`).                                                                                                                                                                | Plugin/channel          | YES, with channel-specific prerequisites and tests.                                                                             |
| Startup recovery                            | External plugins can register a service with `start`/`stop`; startup failures are logged and Gateway continues (`src/plugins/types.ts:2319-2346`, `src/plugins/services.ts:95-154`).                                                                                                                                                                                                   | Plugin                  | YES WITH LIMITATIONS: the plugin owns retry/reconciliation; service health is not Gateway readiness.                            |
| Durable plugin state                        | `api.runtime.state.openKeyedStore` rejects ordinary external plugins (`src/plugins/registry.ts:2622-2657`, `src/plugin-state/plugin-state-store.runtime.test.ts:124-147`). `plugin-sdk/persistent-dedupe` is public for bounded replay keys (`docs/plugins/sdk-subpaths.md:269-273`).                                                                                                  | KM/plugin               | General state: NO. Narrow dedupe: YES. KM should remain the durable workflow store.                                             |

## 3. Recommended bounded plugin architecture and event flow

This is the recommended design only if the narrower contract in the verdict is accepted.

### Inbound flow

1. Register `inbound_claim` at high priority. Match exact configured canonical source tuples and exclude the configured processing tuple before any KM call.
2. Build the KM intake event from `channel`, `accountId`, resolved `conversationId`, `parentConversationId`, provider `messageId`, `sessionKey`, `threadId`, reply fields, sender fields, timestamp, and body.
3. Submit the event to KM's idempotent intake contract with a plugin-owned bounded timeout. Do not fire-and-forget intake.
4. Return no claim (`undefined` or `{ handled: false }`) even after accepted intake. This intentionally avoids the current broadcast-claim completion defect and lets the dedicated gate settle core dedupe.
5. Register `before_dispatch` at a higher priority than unrelated dispatch owners. Match the same source tuple and return `{ handled: true }` with no `text`, regardless of KM health or intake result.
6. The processing channel is excluded from both intake and the source gate unless Michal explicitly wants it gated for a separate reason.

Why two hooks: `inbound_claim` has the richest stable inbound transport fields, while `before_dispatch` has the cleanest current terminal-silence completion path. `message_received` is not a substitute because dispatch schedules it fire-and-forget and proceeds without awaiting it (`src/auto-reply/reply/dispatch-from-config.ts:1927-1949`).

### Final delivery flow

1. KM atomically reserves one `READY_TO_SEND` record and returns an immutable delivery attempt id plus the exact route and payload.
2. A plugin service polls KM, or a plugin-owned authenticated endpoint receives a narrow wake request. The wake request is not itself authority; the plugin rereads and reserves KM state.
3. The sole final-send module calls `sendDurableMessageBatch` with `durability: "required"`, exact channel/account/target/thread/reply fields, and one payload.
4. On `sent`, persist the normalized receipt and all platform message ids in KM using compare-and-set on the reserved attempt.
5. On `suppressed` or a proven pre-send failure, persist that explicit outcome. KM may release/retry only when the contract proves no platform send began.
6. On `partial_failed`, process loss, or unknown provider acceptance, move the KM record to `DELIVERY_UNKNOWN`; never call send again until provider-specific or operator reconciliation proves `not_sent`.
7. `message_sent` is telemetry only. It is not the KM commit trigger because it fires per delivery attempt before queue acknowledgement (`src/infra/outbound/deliver.ts:1740-1762`, `src/infra/outbound/deliver.ts:1933-1956`, `src/infra/outbound/deliver.ts:1371-1384`).

### Session isolation flow

1. Maintain the drafting/reviewer session identities in the KM contract or immutable plugin configuration. Do not infer them from message content.
2. Use `before_tool_call` to block `message` and any other explicitly enumerated outbound-capable tools for restricted sessions. This hook is one of the global fail-closed hooks.
3. Use `message_sending` as defense in depth for canonical sends to configured sources from restricted sessions.
4. Keep ordinary source turns terminal at `before_dispatch`, so they never start a model run that could call tools.
5. Treat native plugins as trusted in-process code. A standard plugin cannot sandbox another plugin that calls a raw adapter or native client.

## 4. Hook and API semantics

### Inbound Discord trace

The current Discord path is:

1. The listener gives the event to the message handler without awaiting full processing (`extensions/discord/src/monitor/listeners.ts:36-55`, `extensions/discord/src/monitor/provider.ts:526-574`).
2. The handler rejects own-bot messages, claims `accountId:channelId:messageId`, and enters debounce (`extensions/discord/src/monitor/message-handler.ts:148-225`, `extensions/discord/src/monitor/message-handler.ts:309-341`).
3. Preflight resolves access, route, mention and context. Accepted work enters a per-session queue (`extensions/discord/src/monitor/message-handler.preflight.ts:208-825`, `extensions/discord/src/monitor/inbound-job.ts:32-44`, `extensions/discord/src/monitor/message-run-queue.ts:96-156`).
4. Processing builds the finalized context, then calls `dispatchChannelInboundReply` (`extensions/discord/src/monitor/message-handler.context.ts:290-430`, `extensions/discord/src/monitor/message-handler.process.ts:938-1128`).
5. The channel kernel records the inbound session before generic dispatch (`src/channels/turn/kernel.ts:472-550`).
6. The provider dispatcher reaches `dispatchReplyFromConfig` (`src/channels/turn/kernel.ts:354-437`, `src/auto-reply/reply/provider-dispatcher.ts:16-38`).
7. Core dedupe runs before hooks. Then targeted `inbound_claim`, broadcast `inbound_claim`, `message_received`, `before_dispatch`, `reply_dispatch`, default resolution, and finally `before_agent_reply` run in that order (`src/auto-reply/reply/dispatch-from-config.ts:1734-1949`, `src/auto-reply/reply/dispatch-from-config.ts:2142-2237`, `src/auto-reply/reply/get-reply.ts:930-963`).
8. If no terminal hook handles the message, `runPreparedReply` starts the ordinary agent path (`src/auto-reply/reply/get-reply.ts:982-1032`).

### Hook comparison

| Hook                    | Timing                                                              | Decision semantics                                     | Failure and timeout                                                                  | Recommendation                                                                               |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `inbound_claim`         | Earliest plugin decision after core inbound dedupe                  | Sequential, descending priority, first `handled` wins  | Fail-open; no generic default timeout; configured timeout skips to next/default path | Intake only, return non-claiming result in the bounded design.                               |
| `message_received`      | Scheduled after claims and before ordinary dispatch                 | Observation only; all handlers run in parallel         | Fire-and-forget at caller; no generic default timeout                                | Telemetry only. Never own intake correctness or gating.                                      |
| `before_dispatch`       | Before `reply_dispatch` and default resolver/model                  | First `handled` wins; no text means terminal silence   | Fail-open; no generic default timeout                                                | Strongest current standard silent gate while plugin is loaded.                               |
| `reply_dispatch`        | Immediately after `before_dispatch`                                 | First `handled` owns dispatch and returns counts       | Fail-open; timeout/error continues                                                   | Too broad for intake gating; useful only for an owner that needs the dispatcher.             |
| `before_agent_reply`    | After directive/inline handling, immediately before model execution | First `handled` wins; missing reply becomes `NO_REPLY` | Fail-open; external plugins require conversation access opt-in                       | Last model-specific guard, not the intake gate.                                              |
| `reply_payload_sending` | After normalized reply payload creation, before `message_sending`   | Sequential payload transform/cancel                    | Fail-open                                                                            | Applies only when the originating path supplies a descriptor; not a universal outbound gate. |
| `message_sending`       | Final canonical delivery policy pass before adapter send            | Sequential; `cancel: true` terminal                    | Runner and delivery wrapper both fail-open                                           | Defense in depth only. Not sufficient alone.                                                 |
| `message_sent`          | After adapter result/throw, before queue acknowledgement            | Parallel observation only                              | Fire-and-forget, errors logged                                                       | Telemetry, not durable completion.                                                           |
| `before_tool_call`      | Before tool execution                                               | Block/approval decision; block terminal                | Global policy is fail-closed                                                         | Restrict direct outbound tools in drafting/reviewer sessions.                                |

The implementation sorts equal-priority hooks in registration order because `toSorted` is stable, but the public guarantee explicitly documents only descending priority and same-priority registration order (`docs/plugins/hooks.md:52-53`, `src/plugins/hooks.ts:272-289`).

### Documentation mismatches

1. `docs/plugins/hooks.md:52-62` says hook handlers run sequentially and that omitted timeouts use generic defaults. Observation hooks actually run in parallel, and the relevant message decision/observation hooks have no generic default timeout (`src/plugins/hooks.ts:207-233`, `src/plugins/hooks.ts:601-635`, `src/plugins/hooks.ts:641-753`).
2. A timeout is implemented with `Promise.race`; plugin work is not cancelled (`src/plugins/hooks.ts:568-590`).
3. `PluginHookMessageContext` says normal inbound hooks currently get `runId`, but `deriveInboundMessageHookContext` does not assign `runId` or trace fields (`src/plugins/hook-message.types.ts:29-45`, `src/hooks/message-hook-mappers.ts:92-170`). Treat inbound `runId` as absent in current behavior.

### Broadcast `inbound_claim` defect

The public result allows `reply` (`src/plugins/hook-types.ts:411-414`). The broadcast path checks only `handled`, does not deliver `reply`, and returns without `commitInboundDedupeIfClaimed()` or `releaseInboundDedupe()` (`src/auto-reply/reply/dispatch-from-config.ts:1899-1924`). A handled broadcast claim therefore:

- produces silence even if the plugin supplied a reply;
- leaves the message in the process-local in-flight set;
- prevents same-process retry after a transient intake failure;
- clears only on process restart.

The focused integration test proves short-circuiting but does not assert reply delivery or a second claim of the same message (`src/auto-reply/reply/dispatch-from-config.test.ts:4898-4967`). Local tag inspection found the introducing commit `da1059a30450` in the current branch but in no public release tag in this checkout, so this is current/fork behavior rather than a shipped public contract.

### WhatsApp difference

WhatsApp docs require `channels.whatsapp.pluginHooks.messageReceived` or the account override before broadcasting personal inbound content (`docs/channels/whatsapp.md:210-248`). The channel-specific emitter enforces that config and uses a bounded two-second queue (`extensions/whatsapp/src/auto-reply/monitor/process-message.ts:76-171`, `extensions/whatsapp/src/auto-reply/monitor/process-message.ts:470-498`).

The same message then reaches generic dispatch (`extensions/whatsapp/src/auto-reply/monitor/process-message.ts:515-576`), where `message_received` is emitted without a WhatsApp policy check (`src/auto-reply/reply/dispatch-from-config.ts:1927-1949`). Static call-graph implication:

- opt-out can still receive the generic emission;
- opt-in can receive the explicit and generic emissions.

The WhatsApp test mocks the downstream dispatcher, so it only proves the explicit emitter. This discrepancy is shipped in local release tags including `v2026.6.5`. It does not block the Discord pilot, but no cross-channel design should depend on `message_received` privacy or exactly-once emission until this is fixed.

### Outbound API inventory and hook re-entry

`openclaw/plugin-sdk/channel-outbound` is the public, documented channel message lifecycle subpath (`docs/plugins/sdk-channel-outbound.md:10-17`, `scripts/lib/plugin-sdk-entrypoints.json:203`). The safest originating API is `sendDurableMessageBatch` (`src/plugin-sdk/channel-outbound.ts:209-218`).

| Originating path                                              | `reply_payload_sending`                           | `message_sending`               | `before_dispatch`           | `reply_dispatch`            | `message_sent`                 |
| ------------------------------------------------------------- | ------------------------------------------------- | ------------------------------- | --------------------------- | --------------------------- | ------------------------------ |
| Direct `sendDurableMessageBatch`                              | Only if caller supplies `replyPayloadSendingHook` | Yes                             | No                          | No                          | Yes on adapter result/throw    |
| Inbound reply through channel kernel                          | Yes when reply dispatcher supplies descriptor     | Yes on durable/core delivery    | Already ran on inbound path | Already ran on inbound path | Yes on durable/core delivery   |
| `api.runtime.subagent.run({ deliver: true })`                 | No                                                | Yes on durable command delivery | No                          | No                          | Yes                            |
| Heartbeat/command direct delivery                             | Usually no                                        | Yes on canonical delivery       | No                          | No                          | Yes                            |
| Gateway `send` RPC                                            | No                                                | Yes                             | No                          | No                          | Yes                            |
| Core `message(action="send")`                                 | No                                                | Yes                             | No                          | No                          | Yes                            |
| Channel plugin `actions.handleAction`                         | No                                                | No                              | No                          | No                          | No                             |
| Core or plugin poll action                                    | No                                                | No                              | No                          | No                          | No                             |
| `api.runtime.channel.outbound.loadAdapter()` or native client | No                                                | No                              | No                          | No                          | No                             |
| Queue replay proven `not_sent`                                | Re-runs if descriptor was persisted               | Re-runs                         | No                          | No                          | Yes for replayed attempt       |
| Queue reconciliation returning `sent`                         | No                                                | No                              | No                          | No                          | No; adapter `afterCommit` runs |

The queue persists the original payload and optional reply-payload hook descriptor, so replay intentionally reruns stateless hooks (`src/infra/outbound/delivery-queue-storage.ts:37-73`). Session context is also persisted, preserving `sessionKey` across queue replay (`src/infra/outbound/delivery-queue-storage.ts:69-73`, `src/infra/outbound/delivery-queue-storage.ts:95-130`).

## 5. Trust, authorization and persistence model

### Correlation fields

| Field                           | Trust/stability                                                               | Availability                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `channelId`                     | Host-derived transport id                                                     | All message hook contexts.                                                                                                                     |
| `accountId`                     | Host-derived, optional                                                        | Inbound/outbound when the channel has an account.                                                                                              |
| `conversationId`                | Host/channel resolved, opaque                                                 | Inbound claim and message hooks; outbound is target `to`.                                                                                      |
| `parentConversationId`          | Channel-resolved, optional                                                    | `inbound_claim` only. Useful for thread/topic matching.                                                                                        |
| `messageId` inbound             | Provider id when supplied; best event-key component                           | `inbound_claim` and `message_received`; absent on malformed/provider events without ids.                                                       |
| `threadId` / `replyToId`        | Provider-native, optional, opaque                                             | Inbound events and selected outbound hook events.                                                                                              |
| `sessionKey`                    | Canonical logical OpenClaw session when attached; persisted in outbound queue | Broad cross-hook correlation. It cannot distinguish concurrent turns in one session and is not a host-minted outbound capability.              |
| `sessionId`                     | Transcript/session instance                                                   | Agent/tool/session hooks, not standard message hooks. Can change on reset/new session.                                                         |
| `runId`                         | One agent turn, stable across model iterations                                | Agent/tool hooks and optional reply-payload hook descriptor. Currently absent from normal inbound mapper and standard outbound delivery hooks. |
| `trace` fields                  | Diagnostic scope, optional                                                    | Process/request scoped. Not durable authorization.                                                                                             |
| receipt platform ids            | Provider acceptance identity where adapter returns one                        | `MessageReceipt.primaryPlatformMessageId`, `platformMessageIds`, and parts. Optional/provider-specific.                                        |
| plugin runtime store            | Process-local `globalThis` slot                                               | Useful for runtime references only; lost on restart (`src/plugin-sdk/runtime-store.ts:52-110`).                                                |
| persistent dedupe               | SQLite-backed bounded key recency                                             | Public `plugin-sdk/persistent-dedupe`; appropriate for event replay keys, not workflow state.                                                  |
| `api.runtime.state` keyed store | Durable SQLite state                                                          | Bundled/trusted official plugins only in this release; unavailable to a normal external plugin.                                                |
| KM record/version/attempt       | Durable authority if KM contract supplies it                                  | Required for readiness, reservation, authorization, retry and reconciliation.                                                                  |

### Authorization model

Do not use content, `channelData`, a magic prefix, or a user-copyable marker as authorization. The recommended bounded model is:

- KM owns immutable record id, readiness version and atomic delivery-attempt reservation.
- The final-send service is the only plugin module allowed to call `sendDurableMessageBatch`.
- Restricted model sessions are denied at `before_tool_call` and canonical delivery is denied again at `message_sending`.
- The final adapter does not ask `message_sending` to infer authorization from content. It is authorized by plugin control flow plus KM's reservation.
- A static test scans the plugin package so no other module imports the outbound send API.

This is cooperative process trust, not a capability-security boundary. OpenClaw native plugins execute as trusted in-process code and can load raw adapters or use native network clients. If protection from other plugins is required, process isolation or a host-minted delivery capability is necessary.

### Lifecycle

`api.registerService` is the right standard surface for a polling worker or reconnect/recovery loop (`docs/plugins/sdk-overview.md:153-168`, `src/plugins/types.ts:2319-2346`). Services start sequentially after channels and stop in reverse order; failures are logged and do not abort Gateway startup (`src/gateway/server-startup-post-attach.ts:781-835`, `src/plugins/services.ts:95-154`).

`gateway_start` is useful only when Gateway-owned state is required. It runs after sidecars and is scheduled asynchronously, so it is not a readiness guarantee (`src/gateway/server-startup-post-attach.ts:1390-1428`, `docs/reference/test.md:167-172`). `memory-core` demonstrates startup reconciliation, bounded retry and timer cleanup using public hooks (`extensions/memory-core/src/dreaming.ts:697-918`).

Design comparison:

| Design                                                | Advantages                                                                                            | Risks                                                                                                            | Recommendation                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Plugin service polls KM                               | No broad Gateway credential in KM; startup recovery is plugin-owned; easy fail-closed when KM is down | Poll interval/lease design, service health is not readiness, plugin owns timers/backoff                          | Acceptable fallback when KM cannot call a narrow endpoint.                                                      |
| KM wakes plugin through authenticated plugin endpoint | Lower latency and less polling; KM already knows readiness transition                                 | Authentication/replay contract must be explicit; wake must not be authority; Gateway credential may be too broad | Preferred only if a narrow plugin-owned authenticated route is defined. Plugin still rereads/reserves KM state. |
| KM calls generic Gateway `send`                       | Existing idempotency key parameter                                                                    | Gateway dedupe is process-local and the key is not passed to native adapter; grants a broad delivery surface     | Reject for sole-sender authority.                                                                               |

## 6. Exactly-once limitations and ownership split

Exactly-once must be split into separate facts:

| Stage                             | Available guarantee                                                                            | Owner                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------- |
| Stable inbound event identity     | Provider `messageId` plus canonical route when available                                       | Provider/plugin/KM    |
| Duplicate intake                  | Atomic `put-if-absent` or equivalent in KM; public persistent dedupe may reduce repeated calls | KM, optionally plugin |
| READY authorization               | Persisted readiness version/token that cannot be inferred from text                            | KM                    |
| Worker concurrency                | Atomic `READY_TO_SEND -> SENDING` reservation returning one attempt id                         | KM                    |
| Queue intent                      | OpenClaw writes a new random queue row before each send call                                   | Core                  |
| Native send started               | Queue records `send_attempt_started` before adapter call                                       | Core                  |
| Provider accepted                 | Adapter returns a result, usually including a platform message id                              | Channel/provider      |
| Queue committed                   | Queue row is acknowledged after results return; adapter commit hooks run after ack             | Core                  |
| KM committed                      | Receipt is persisted with CAS against reserved attempt                                         | KM/plugin             |
| Crash before platform send        | Queue may retry after recovery/backoff                                                         | Core                  |
| Crash after send may have started | No blind replay; reconcile or fail/strand                                                      | Core/channel/KM       |
| Visible exactly once              | Not guaranteed without provider idempotency or reliable reconciliation                         | Provider/KM           |

Important limits:

1. Two worker calls create two queue ids and can both send. KM reservation is mandatory (`src/infra/outbound/delivery-queue-storage.ts:95-130`).
2. Gateway `send` idempotency joins in-flight calls and caches outcomes only in the Gateway request context map. It is not restart-stable (`src/gateway/server-methods/send.ts:64-161`, `src/gateway/server-runtime-state.ts:112`).
3. The Gateway idempotency key is used for response dedupe and transcript mirroring, not passed into the native message send context (`src/gateway/server-methods/send.ts:781-805`, `src/channels/message/types.ts:168-217`).
4. `message_sent` success proves an adapter returned an identity, not queue acknowledgement, KM persistence, or user-visible rendering.
5. OpenClaw's recovery policy prevents a duplicate by refusing unknown replay. That is an at-most-once safety choice, not an exactly-once liveness guarantee (`src/infra/outbound/delivery-queue.recovery.test.ts:138-232`).
6. Reconciliation is a generic channel capability, but no production adapter in this checkout declares/implements it. Tests prove `sent`, `not_sent`, and `unresolved` behavior only (`src/infra/outbound/delivery-queue.recovery.test.ts:234-429`).
7. One authorized logical batch can intentionally produce multiple platform messages after text chunking or multi-part media delivery. KM must store the full receipt, not equate one adapter call with one visible platform message (`src/channels/message/types.ts:73-94`, `src/channels/message/receipt.ts:45-115`).

Required wording for downstream acceptance: **"Duplicate workers produce at most one KM-reserved OpenClaw send call. Unknown provider outcomes are not retried until reconciled. A returned platform receipt is persisted once."** Do not claim exactly-once visible delivery.

## 7. SDK and core gaps

| Gap                                                                   | Classification                                      | Smallest generic response                                                                                                                                                                                                                                |
| --------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Broadcast `inbound_claim` ignores `reply` and leaves dedupe in-flight | Current core defect                                 | Centralize terminal claim completion so targeted and broadcast claims deliver optional reply, emit observation once, settle dedupe, and return one canonical result.                                                                                     |
| `message_received` WhatsApp privacy/duplicate mismatch                | Channel/core integration defect                     | Make generic emission channel-policy-controlled and remove the duplicate channel-local emitter. Not required for Discord pilot.                                                                                                                          |
| Message decision hooks fail open on handler error/timeout             | Reusable SDK gap if strict fail-closed is required  | Add a typed, opt-in failure decision for terminal message hooks, with compatibility review. A plugin must declare the safe terminal result, not merely `catchErrors: false`.                                                                             |
| Plugin absent/load failure cannot gate configured sources             | Deployment/architecture issue                       | Required-plugin startup health or an operator-owned routing gate is needed. A hook cannot run when the plugin is absent.                                                                                                                                 |
| No trusted outbound origin/authorization/intent id in hooks or queue  | Reusable SDK gap for strict sole-sender enforcement | Add a runtime-bound durable send API that host-stamps `originPluginId` and a caller idempotency/authorization reference, persists both in the queue, and exposes read-only provenance to outbound policy hooks and results. Do not expose a text marker. |
| Raw adapters/actions/native clients bypass outbound hooks             | Trusted-process architecture issue                  | Either accept native plugins as trusted and gate model tools, or route all send-capable SDK methods through the same host send service. True hostile-plugin isolation needs a process boundary.                                                          |
| General durable keyed state unavailable to normal external plugins    | Intentional SDK limitation                          | Keep workflow/readiness/attempt state in KM. Use public persistent dedupe only for bounded replay keys. Do not add a Deliberation state store.                                                                                                           |
| No provider idempotency or production unknown-send reconciliation     | Provider/KM requirement, not generic core logic     | Implement channel-specific reconciliation where the provider offers a reliable lookup/idempotency contract; otherwise keep `UNKNOWN` and require operator/provider evidence.                                                                             |

### Strict core prerequisite

If Michal keeps the literal "only authorized send can ever pass" requirement, the smallest generic prerequisite is a **runtime-bound durable outbound intent**:

```text
api.runtime.channel.outbound.sendDurable({
  idempotencyKey,
  authorizationRef,
  channel,
  accountId,
  to,
  payloads,
  replyToId,
  threadId
})
```

Core, not the plugin, must stamp the loaded plugin id; persist plugin id, idempotency key and opaque authorization reference in the queue; enforce uniqueness for the idempotency key; expose read-only intent provenance to `message_sending`/`message_sent`; and preserve it through recovery. Existing `sendDurableMessageBatch` is a public import, not runtime-bound, creates a random queue id for every call, and exposes no provenance to hooks, so it cannot satisfy this strict boundary.

## 8. Alternatives considered and rejected

### `message_received` owns intake

Rejected. It is observation-only, handlers run in parallel, and the dispatch caller does not await completion. A normal model run can begin while the observer is still writing to KM. WhatsApp also has an unresolved opt-in/double-emission discrepancy.

### `inbound_claim` returns `handled: true` for everything

Rejected for the current checkout. It suppresses the model early, but the broadcast path does not settle dedupe or deliver an optional reply. Returning a non-claiming result and using `before_dispatch` avoids that defect while preserving rich intake fields.

### `before_agent_reply` as the only gate

Rejected. It is later than directives/inline actions, requires `allowConversationAccess` for external plugins, and only protects the default model path. It is useful as optional defense in depth, not the primary source gate.

### `message_sending` as the sole protection

Rejected. The model and tools have already run, failures/timeouts are fail-open, the context lacks trusted sender provenance, and raw actions/adapters/native sends bypass it.

### Magic content marker

Rejected. It is user/model forgeable, leaks authorization into payload bytes, and cannot safely survive quoting, rewriting, retries or provider transformations.

### Generic Gateway `send` with an idempotency key

Rejected as the authority path. Dedupe is process-local and the idempotency key does not reach the native provider send. It improves duplicate RPC handling within one Gateway lifetime only.

### Plugin-owned state file or second database

Rejected. KM is already the durable owner, external plugins cannot use the general keyed-state runtime, and OpenClaw policy forbids new file-backed runtime state. The public persistent-dedupe helper is limited to replay keys.

### Blind retry after an unknown Discord result

Rejected. Without provider reconciliation or idempotency, retry can create a visible duplicate. OpenClaw intentionally refuses this replay.

## 9. Exact rewrite proposal for `bright-wave-6041`

Replace the current task wording with the following.

### Objective

Implement a standard external OpenClaw plugin that performs Discord-pilot Deliberation v2 intake, terminal source silence, restricted-session tool/delivery guards, and one KM-reserved durable final-send attempt. KM remains the sole durable workflow, readiness, authorization, reservation and reconciliation owner.

Do not claim exactly-once visible delivery. Treat an unknown provider outcome as terminal `DELIVERY_UNKNOWN` until reconciled.

### Prerequisites and stop conditions

Stop before implementation if any item is missing:

1. KM supplies a deterministic inbound event key contract using provider `messageId` plus canonical route, including behavior when `messageId` is absent.
2. KM supplies an idempotent intake operation and its accepted/duplicate/unavailable outcomes.
3. KM supplies immutable `recordId`, readiness version or authorization reference, and exact `READY_TO_SEND` payload/route fields.
4. KM supplies atomic reservation/CAS so only one worker can transition `READY_TO_SEND -> SENDING` and obtain one `deliveryAttemptId`.
5. KM supplies terminal operations for `SENT(receipt)`, `SUPPRESSED(reason)`, proven `NOT_SENT`, and `DELIVERY_UNKNOWN`.
6. KM supplies a reconciliation contract that forbids retry while outcome is unknown.
7. The exact Discord account id, source channel id, processing channel id, thread/reply behavior, and restricted drafting/reviewer session identities are specified. Display names such as `#test-deliberation` are not sufficient runtime identifiers.
8. Michal explicitly accepts the bounded guarantees in this report, or the generic core prerequisites in section 7 land first.

### Plugin config

Define strict manifest JSON Schema under `plugins.entries.<id>.config` for:

```ts
type DeliberationPluginConfig = {
  enabled: boolean;
  failClosed: true;
  sources: Array<{
    channel: string;
    accountId?: string;
    target: string;
  }>;
  processingSource: {
    channel: string;
    accountId?: string;
    target: string;
  };
  km: {
    endpoint: string;
    requestTimeoutMs: number;
    pollIntervalMs?: number;
  };
  restrictedSessionKeys: string[];
};
```

Use canonical opaque target ids. Keep secrets in the standard credential/SecretRef surface selected by the plugin owner; do not put secret values in examples. Set manifest startup activation when a worker service must start with Gateway. Manifest and registration patterns are documented at `docs/plugins/sdk-setup.md:219-268` and `docs/plugins/sdk-setup.md:357-375`.

### Required interfaces

Inbound request:

```ts
type DeliberationInboundEvent = {
  eventKey: string;
  channel: string;
  accountId?: string;
  conversationId: string;
  parentConversationId?: string;
  messageId: string;
  sessionKey?: string;
  senderId?: string;
  threadId?: string | number;
  replyToId?: string;
  replyToBody?: string;
  replyToSender?: string;
  timestamp?: number;
  body: string;
};
```

Ready delivery:

```ts
type ReadyDelivery = {
  recordId: string;
  readinessVersion: string;
  deliveryAttemptId: string;
  state: "SENDING";
  channel: string;
  accountId?: string;
  to: string;
  text: string;
  threadId?: string | number;
  replyToId?: string;
};
```

Receipt completion must accept `status`, OpenClaw queue intent id when available, normalized platform message ids, thread/reply correlation, timestamp, and an error/suppression/unknown category without persisting raw secret-bearing errors.

### Required plugin behavior

1. Register `inbound_claim` for strict source matching and synchronous bounded KM intake. Return non-claiming after every handled source event.
2. Register `before_dispatch` as a pure terminal source gate. Return `{ handled: true }` with no text for every configured source, including KM unavailable/error/timeout states.
3. Exclude the processing source before intake and before source gating.
4. Use the public persistent dedupe helper only as an optimization around KM intake. KM remains canonical.
5. Register `before_tool_call` to block direct outbound-capable tools for restricted session keys. At minimum cover `message`; enumerate additional tools from the actual drafting/reviewer tool policy before coding.
6. Register `message_sending` as defense in depth for canonical sends from restricted sessions to configured source targets. Return cancellation synchronously from local/KM-prepared facts; do not make delivery permission depend on a slow network lookup.
7. Register a service for bounded KM polling, or a plugin-owned authenticated wake endpoint. In both designs, reread and atomically reserve KM state before send.
8. Put the only `sendDurableMessageBatch` import/call in the final-send adapter module.
9. Send with required queue durability and exact route/reply/thread fields. Persist `sent`, `suppressed`, `failed-before-send`, `partial_failed`, and `unknown` distinctly.
10. Never retry `partial_failed` or unknown-after-send without reconciliation proof.
11. Do not add a public marker, v1 fallback, dual write, live config mutation, cron mutation, second workflow store, or channel-specific policy outside the plugin.

### Non-scope

- KM spool, drafting, reviewer, debounce, readiness, retry or reconciliation implementation.
- OpenClaw core changes unless Michal selects the strict-core path.
- WhatsApp or Slack enablement.
- Live routing/config/cron mutation.
- Provider-level exactly-once claims.
- Protection against malicious native plugins in the same process.

### Acceptance criteria

1. Two deliveries with the same provider event key produce one canonical KM record; a missing provider id follows the explicit KM fallback contract.
2. The processing source produces no intake event and no recursive final send.
3. Every configured source turn ends at `before_dispatch` with no model call and no ordinary visible reply, including KM timeout/unavailable/error.
4. Hook failure behavior is tested explicitly. If the plugin itself is absent or a host timeout skips the gate, the test documents that the strict guarantee is unavailable and the task stops unless the core prerequisite is accepted.
5. Restricted drafting/reviewer sessions cannot execute the `message` tool and their canonical outbound payloads are cancelled.
6. Duplicate workers race on one READY record; exactly one obtains the KM reservation and exactly one OpenClaw send call occurs.
7. A successful send persists one normalized receipt with returned platform ids.
8. A crash before platform send can recover; a crash after send may have started is not blindly retried and leaves `DELIVERY_UNKNOWN` without a second send call.
9. Static scans find one outbound-send import/call site, no `__deliberated__` marker, no v1 write/fallback, and no production WhatsApp/Slack source config.
10. Tests say "one reserved attempt" and "unknown requires reconciliation" rather than "exactly once visible".

### Verification commands

Use the new plugin's exact path once selected, plus the smallest shared characterization suites:

```bash
pnpm test <deliberation-plugin-path>
pnpm test src/plugins/wired-hooks-inbound-claim.test.ts src/plugins/wired-hooks-reply-dispatch.test.ts src/plugins/hooks.before-agent-reply.test.ts
pnpm test src/plugins/wired-hooks-message.test.ts src/plugins/wired-hooks-reply-payload-sending.test.ts src/plugins/hooks.security.test.ts src/plugins/hooks.correlation.test.ts
pnpm test src/infra/outbound/deliver.test.ts src/infra/outbound/delivery-queue.recovery.test.ts src/channels/message/receipt.test.ts
pnpm build
pnpm check:changed
```

The implementation must also run a deterministic duplicate-worker/restart test repeatedly and a static import/marker scan scoped to the new plugin package.

## 10. Open decisions for Michal

1. Accept the bounded standard-plugin contract, or require the generic fail-closed/provenance core seams before `bright-wave-6041` starts.
2. Define whether "unavailable" means KM unavailable while the plugin remains loaded, or includes plugin load/registration failure. Existing hooks cannot cover the latter.
3. Choose polling or a narrow authenticated KM-to-plugin wake endpoint and define its authentication/replay contract.
4. Provide canonical Discord ids and decide whether source matching is per channel, thread, account, or all three.
5. Define restricted drafting/reviewer session identities and the complete outbound-capable tool list.
6. Decide the operational owner and evidence required to resolve `DELIVERY_UNKNOWN` on Discord.
7. Decide whether an at-most-one send attempt that can remain unknown/non-delivered satisfies the pilot. If not, provider reconciliation is a hard prerequisite.

## 11. Precedent and regression surface

Public-SDK precedents:

- `extensions/codex/index.ts:27-43`, `extensions/codex/index.ts:123-131`: live config resolution and `inbound_claim` registration. This investigation uses it only as Plugin SDK registration precedent, not as evidence about Codex protocol/runtime behavior.
- `extensions/acpx/index.ts:9-21`: service plus `reply_dispatch`; keyed state use is bundled-only.
- `extensions/thread-ownership/index.ts:78-208`: `message_received` plus `message_sending`, including explicit fail-open network behavior.
- `extensions/memory-core/src/dreaming.ts:697-918`: startup reconciliation, bounded retry and `gateway_stop` cleanup.
- `extensions/discord/src/channel-actions.ts:195-288`: Discord `prepareSendPayload` preserves core delivery for ordinary `send`, while other plugin actions remain alternate paths.

Smallest existing regression suites:

- `src/plugins/wired-hooks-inbound-claim.test.ts`
- `src/plugins/hooks.before-agent-reply.test.ts`
- `src/plugins/wired-hooks-reply-dispatch.test.ts`
- `src/plugins/wired-hooks-reply-payload-sending.test.ts`
- `src/plugins/wired-hooks-message.test.ts`
- `src/plugins/hooks.security.test.ts`
- `src/plugins/hooks.correlation.test.ts`
- `src/auto-reply/reply/dispatch-from-config.test.ts`
- `src/auto-reply/reply/inbound-dedupe.test.ts`
- `src/infra/outbound/deliver.test.ts`
- `src/infra/outbound/delivery-queue.recovery.test.ts`
- `src/channels/message/receipt.test.ts`
- `src/plugins/services.test.ts`
- `src/plugin-state/plugin-state-store.runtime.test.ts`
- `src/plugin-sdk/memory-host-events.test.ts`
- `extensions/discord/src/monitor/message-handler.queue.test.ts`
- `extensions/whatsapp/src/auto-reply/monitor/process-message.test.ts`

## 12. Inspected paths and command results

### Investigation inputs and guidance

- `AGENTS.md`
- `docs/AGENTS.md`
- `src/plugin-sdk/AGENTS.md`
- `src/plugins/AGENTS.md`
- `src/channels/AGENTS.md`
- `src/infra/outbound/AGENTS.md`
- `src/agents/AGENTS.md`
- `src/agents/tools/AGENTS.md`
- `src/gateway/AGENTS.md`
- `src/gateway/server-methods/AGENTS.md`
- `extensions/AGENTS.md`
- `extensions/acpx/AGENTS.md`
- `scripts/AGENTS.md`
- `plans/2026-07-27_wild-peak-6037_investigate-deliberation-v2-against-standard-openclaw.md`
- `plans/tasks/2026-07-27_deliberation-v2-channel-intake-gate-final-send-adapter.md`
- `docs/reference/test.md`
- `package.json`
- `.agents/skills/technical-documentation/references/principles.md`
- `.agents/skills/technical-documentation/references/openclaw.md`
- `.agents/skills/technical-documentation/references/build.md`

### Public docs and contracts

- `docs/plugins/hooks.md`
- `docs/plugins/sdk-overview.md`
- `docs/plugins/sdk-runtime.md`
- `docs/plugins/sdk-channel-outbound.md`
- `docs/plugins/sdk-setup.md`
- `docs/plugins/sdk-subpaths.md`
- `docs/channels/whatsapp.md`
- `scripts/lib/plugin-sdk-entrypoints.json`

### Hook, inbound and correlation source/tests

- `src/plugins/hook-message.types.ts`
- `src/plugins/hook-types.ts`
- `src/plugins/hooks.ts`
- `src/plugins/hook-runner-global.ts`
- `src/plugins/hook-agent-context.ts`
- `src/plugins/registry.ts`
- `src/hooks/message-hook-mappers.ts`
- `src/auto-reply/reply/dispatch-from-config.ts`
- `src/auto-reply/reply/get-reply.ts`
- `src/auto-reply/reply/provider-dispatcher.ts`
- `src/auto-reply/reply/inbound-dedupe.ts`
- `src/channels/turn/kernel.ts`
- `extensions/discord/src/monitor/listeners.ts`
- `extensions/discord/src/monitor/provider.ts`
- `extensions/discord/src/monitor/message-handler.ts`
- `extensions/discord/src/monitor/message-handler.preflight.ts`
- `extensions/discord/src/monitor/message-handler.context.ts`
- `extensions/discord/src/monitor/message-handler.process.ts`
- `extensions/discord/src/monitor/inbound-job.ts`
- `extensions/discord/src/monitor/message-run-queue.ts`
- `extensions/discord/src/monitor/inbound-dedupe.ts`
- `extensions/whatsapp/src/auto-reply/monitor/process-message.ts`
- `src/plugins/wired-hooks-inbound-claim.test.ts`
- `src/plugins/hooks.before-agent-reply.test.ts`
- `src/plugins/wired-hooks-reply-dispatch.test.ts`
- `src/auto-reply/reply/dispatch-from-config.test.ts`

### Outbound, durability and isolation source/tests

- `src/plugin-sdk/channel-outbound.ts`
- `src/plugin-sdk/persistent-dedupe.ts`
- `src/plugin-sdk/runtime-store.ts`
- `src/channels/message/send.ts`
- `src/channels/message/types.ts`
- `src/channels/message/receipt.ts`
- `src/infra/outbound/deliver.ts`
- `src/infra/outbound/message.ts`
- `src/infra/outbound/session-context.ts`
- `src/infra/outbound/delivery-queue.ts`
- `src/infra/outbound/delivery-queue-storage.ts`
- `src/infra/outbound/delivery-queue-recovery.ts`
- `src/infra/outbound/message-action-runner.ts`
- `src/infra/outbound/outbound-send-service.ts`
- `src/agents/tools/message-tool.ts`
- `src/plugins/runtime/types-channel.ts`
- `src/gateway/server-methods/send.ts`
- `src/gateway/server-runtime-state.ts`
- `extensions/discord/src/channel-actions.ts`
- `src/infra/outbound/deliver.test.ts`
- `src/infra/outbound/delivery-queue.recovery.test.ts`
- `src/channels/message/receipt.test.ts`

### Lifecycle, state, config and precedents

- `src/plugins/services.ts`
- `src/plugins/types.ts`
- `src/gateway/server-startup-post-attach.ts`
- `src/config/zod-schema.ts`
- `src/plugins/manifest.ts`
- `src/plugin-state/plugin-state-store.types.ts`
- `src/plugin-state/plugin-state-store.sqlite.ts`
- `src/plugin-state/plugin-state-store.runtime.test.ts`
- `src/plugin-sdk/memory-host-events.test.ts`
- `src/plugins/services.test.ts`
- `extensions/acpx/index.ts`
- `extensions/acpx/openclaw.plugin.json`
- `extensions/codex/index.ts`
- `extensions/thread-ownership/index.ts`
- `extensions/thread-ownership/openclaw.plugin.json`
- `extensions/memory-core/src/dreaming.ts`
- `extensions/memory-core/src/dreaming.test.ts`

### Commands run directly

| Command                                                                                                                                                                                                                                                           | Result                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short && git rev-parse HEAD && node --version && pnpm --version`                                                                                                                                                                                    | Baseline recorded; unrelated untracked files already existed. Commit `0b4e3efe...`, Node `v25.6.1`, pnpm `11.2.2`.                                                               |
| `pnpm docs:list`                                                                                                                                                                                                                                                  | Passed; relevant plugin/channel docs inventory confirmed.                                                                                                                        |
| `pnpm test src/plugins/wired-hooks-inbound-claim.test.ts src/plugins/hooks.before-agent-reply.test.ts src/plugins/wired-hooks-reply-dispatch.test.ts`                                                                                                             | Passed: 3 files, 19 tests.                                                                                                                                                       |
| `pnpm test src/plugins/wired-hooks-reply-payload-sending.test.ts src/plugins/wired-hooks-message.test.ts src/plugins/hooks.security.test.ts src/plugins/hooks.correlation.test.ts`                                                                                | Passed: 4 files, 33 tests.                                                                                                                                                       |
| `pnpm test src/infra/outbound/deliver.test.ts src/infra/outbound/delivery-queue.recovery.test.ts src/channels/message/receipt.test.ts src/plugins/services.test.ts src/plugin-state/plugin-state-store.runtime.test.ts src/plugin-sdk/memory-host-events.test.ts` | Passed: 6 files, 141 tests across 4 shards.                                                                                                                                      |
| Focused test commands above, rerun during final verification                                                                                                                                                                                                      | Passed again: 13 files, 193 tests total.                                                                                                                                         |
| `pnpm docs:check-mdx`                                                                                                                                                                                                                                             | Passed: 679 files.                                                                                                                                                               |
| `pnpm lint:docs docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md plans/investigations/wild-peak-6037_investigate-deliberation-v2-standard-plugin-capabilities.md`                                                                  | Passed: 0 issues.                                                                                                                                                                |
| `pnpm build`                                                                                                                                                                                                                                                      | Passed: full build completed in 83.3 seconds.                                                                                                                                    |
| Local mirror and citation-bound validation                                                                                                                                                                                                                        | Passed: docs mirror matches the canonical report body; 209 source/doc citations resolve within file bounds.                                                                      |
| `pnpm exec oxfmt --check --config .oxfmtrc.jsonc docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md plans/investigations/wild-peak-6037_investigate-deliberation-v2-standard-plugin-capabilities.md`                                 | Passed: both report copies use the repository format.                                                                                                                            |
| `git status --short --untracked-files=all && git diff --check && git diff --name-only && git diff --numstat`                                                                                                                                                      | Passed for tracked scope: no tracked source/config diff or whitespace error. Task reports are untracked; unrelated pre-existing/concurrent untracked artifacts remain untouched. |
| `git branch --show-current && git describe --tags --always --dirty && git describe --tags --abbrev=0`                                                                                                                                                             | Current branch and nearest local tag recorded.                                                                                                                                   |
| `git blame` on broadcast claim, WhatsApp emission/dispatch and outbound send hook ranges                                                                                                                                                                          | Provenance inspected; broadcast claim commit is not in a public release tag in this checkout, while WhatsApp explicit emission and fail-open outbound hook behavior are shipped. |
| `git tag --contains` for the relevant introducing commits                                                                                                                                                                                                         | Current versus release-tag reachability recorded.                                                                                                                                |

### Delegated narrow reconnaissance commands

The bounded source-audit agents also ran these existing tests without editing files:

- Six inbound/Discord/WhatsApp files: 44 tests passed.
- Two full dispatch integration files: 195 passed, 2 failed on current branch expectations around broadcast claim/authorized binding behavior. No task code existed, so these are baseline failures and were not modified.
- Focused outbound/delivery/message/service commands: 392 tests passed across six Vitest shards.

No live Discord or WhatsApp provider test was run. No KM, workspace, Mission Control, live config, cron state, external proposal file, or external repository was inspected.

## Machine-readable summary

```json
{
  "verdict": "NO",
  "recommended_inbound_hook": "inbound_claim (non-claiming, bounded synchronous KM intake)",
  "recommended_fail_closed_hook": "before_dispatch (handled=true with no text; guarantee applies only while the plugin hook runs)",
  "recommended_send_api": "openclaw/plugin-sdk/channel-outbound sendDurableMessageBatch with required queue durability",
  "core_change_required": true,
  "open_decisions": [
    "accept bounded plugin-only guarantees or require strict generic core seams",
    "define unavailable as KM-only or include plugin load failure",
    "choose polling or authenticated KM wake",
    "provide canonical Discord source and processing identifiers",
    "define restricted session identities and outbound-capable tools",
    "define Discord unknown-delivery reconciliation ownership",
    "accept at-most-one attempt with possible UNKNOWN outcome"
  ],
  "implementation_task_changes": [
    "split inbound_claim intake from before_dispatch silence",
    "make KM atomic reservation and UNKNOWN reconciliation hard prerequisites",
    "replace exactly-once-visible wording with one reserved attempt plus receipt persistence",
    "add before_tool_call and message_sending restricted-session guards",
    "use sendDurableMessageBatch only from one final adapter module",
    "add explicit plugin-absence, timeout, duplicate-worker and restart stop conditions",
    "keep WhatsApp, Slack, live config, cron, v1 fallback and second state stores out of scope"
  ]
}
```
