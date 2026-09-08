# Discord plugin approval expiry investigation

Task: `cool-wave-3470`  
Source snapshot: `a213e2223eed644c5cdbe26d1a8c4a7a7b023770`  
Verification runtime: Node `v25.9.0`, pnpm `11.2.2`

## Scope

This investigation traces the native Discord plugin-approval lifecycle from request creation through expiration and native button resolution. It distinguishes the native `execapproval` control from generic forwarded plugin components, identifies every local queue or awaited boundary before `plugin.approval.resolve`, and classifies the supplied operator evidence without assuming the user clicked late.

No production code, runtime configuration, Gateway process, Discord registration, live approval, or external repository was changed or exercised. The requested `scripts/investigation-path.py` helper is absent, so this report uses the plan's fallback path.

## Verdict

**Proven immediate failure condition:** the Gateway received `plugin.approval.resolve` after the approval had expired and could not find a pending record visible to that caller. The nominal 15-second resolved-entry grace period had also elapsed, so ordinary expiry cleanup fully explains the `unknown or expired approval id` response. The intentionally indistinguishable public error does not independently prove cleanup rather than an invisible record or wrong target (`src/gateway/exec-approval-manager.ts:12-26`, `src/gateway/exec-approval-manager.ts:159-177`, `src/gateway/server-methods/approval-shared.ts:504-565`).

**Root cause of the late resolve RPC: not proven by the supplied timestamps.** The evidence starts with Discord message creation/expiry and the eventual Gateway rejection, but has no authoritative timestamp for Discord's `INTERACTION_CREATE`, local component-handler entry, acknowledgement queueing/completion, or resolver-client readiness. It cannot distinguish a late Discord/client interaction from local pre-RPC delay, and it does not justify attributing the delay to the user.

**Active agent tool execution is not a direct blocker for the native click.** Production Discord startup disables the gateway wrapper's automatic interaction path and registers one detached `DiscordInteractionListener`. Message and interaction listeners return without awaiting agent/session work, so a pending agent tool or per-session run does not retain a Discord event-queue slot (`extensions/discord/src/monitor/gateway-plugin.ts:421-427`, `extensions/discord/src/monitor/provider.startup.ts:240-265`, `extensions/discord/src/monitor/listeners.ts:36-76`).

**One concrete pre-RPC wait remains in the native handler:** it awaits the Discord interaction acknowledgement before creating the resolver Gateway client. The acknowledgement uses the monitor's shared REST scheduler. It has critical priority, but it cannot preempt active workers and can wait behind a global or matching-route rate-limit deadline; critical requests have no stale deadline (`extensions/discord/src/monitor/exec-approvals.ts:80-127`, `extensions/discord/src/internal/interactions.ts:275-295`, `extensions/discord/src/internal/rest.ts:148-220`, `extensions/discord/src/internal/rest.ts:363-369`, `extensions/discord/src/internal/rest-scheduler.ts:399-463`). This is a supported delay mechanism, not evidence that it happened in either reported attempt.

**Recommendation:** do not change approval policy, timeout, routing, or queue behavior from this evidence. The best next step is one correlated timing capture at the existing boundaries listed below. The separately owned five-minute timeout task `calm-wave-9279` may widen the user window, but it neither explains nor diagnoses the observed pre-RPC delay.

## Operator Timeline

### Current attempt

| Event                                                                                        |           Operator timestamp | Delta from Discord message |
| -------------------------------------------------------------------------------------------- | ---------------------------: | -------------------------: |
| Approval request began                                                                       | approximately `14:48:26.930` |                  `-0.285s` |
| Discord created message `1546864798057373708` in channel `1483778179700228147`               |               `14:48:27.215` |                       `0s` |
| `plugin.approval.waitDecision` returned timeout/null                                         |               `14:50:26.891` |                `+119.676s` |
| Tool reported timeout                                                                        |               `14:50:26.898` |                `+119.683s` |
| Discord accepted the expired-card edit                                                       |               `14:50:27.252` |                `+120.037s` |
| Gateway rejected `plugin.approval.resolve` for `plugin:74a580a5-172f-4f94-a0b3-3b27a656204d` |               `14:50:50.662` |                `+143.447s` |
| Discord error follow-up completed                                                            |               `14:50:51.072` |                `+143.857s` |

The resolve rejection was `23.771s` after `waitDecision` returned and `23.410s` after Discord accepted the expired-card edit. Manager expiry retains a resolved record for only 15 seconds, so cleanup would have been due near `14:50:41.891`; the rejection arrived about `8.771s` after that deadline. The timing and error are strongly consistent with ordinary post-expiry deletion. The same error can also hide an invisible record by design, but local native approval clients are trusted approval-runtime clients and the evidence does not indicate an identity failure (`src/gateway/server-methods/approval-shared.ts:121-155`, `src/gateway/server-methods/approval-shared.ts:288-328`).

### Prior attempt

| Event                              | Operator timestamp |                                        Delta |
| ---------------------------------- | -----------------: | -------------------------------------------: |
| Discord created approval card      |     `14:39:00.426` |                                         `0s` |
| Discord accepted expired-card edit |     `14:41:00.331` |                                  `+119.905s` |
| Discord error response             |     `14:41:44.114` | `+163.688s`, or `+43.783s` after expiry edit |

The prior attempt shows the same broad symptom but has no resolve-RPC timestamp, interaction ID, or inbound-receipt timestamp. It strengthens recurrence evidence, not causal attribution.

## Native Lifecycle

1. A plugin `before_tool_call` approval calls `plugin.approval.request` with `twoPhase: true`, then independently calls `plugin.approval.waitDecision`. The tool-side RPC timeout is buffered beyond the approval timeout, but the approval decision remains governed by the requested `timeoutMs` (`src/agents/agent-tools.before-tool-call.ts:430-568`).
2. The Gateway server generates a `plugin:<uuid>` ID, creates the record, binds requester connection/device/client metadata, registers the manager timer, broadcasts the request, and immediately returns the accepted phase before continuing to await the manager decision (`src/gateway/server-methods/plugin-approval.ts:70-139`, `src/gateway/server-methods/approval-shared.ts:383-501`).
3. The manager computes `createdAtMs`/`expiresAtMs`, schedules expiration for the same timeout, resolves waiters with `null` at expiry, marks the record resolved, and removes it after 15 seconds (`src/gateway/exec-approval-manager.ts:12-30`, `src/gateway/exec-approval-manager.ts:64-121`, `src/gateway/exec-approval-manager.ts:159-177`).
4. The native channel runtime receives `plugin.approval.requested`, delivers the card, and schedules its own display-expiration timer from `request.expiresAtMs - now`. This timer is separate from the manager timer (`src/infra/exec-approval-channel-runtime.ts:129-203`, `src/infra/exec-approval-channel-runtime.ts:226-247`).
5. Discord renders plugin and exec approvals through the same native container/button machinery. Plugin IDs remain prefixed; button custom IDs are `execapproval:id=<encoded-id>;action=<decision>` (`extensions/discord/src/approval-handler.runtime.ts:114-149`, `extensions/discord/src/approval-handler.runtime.ts:218-239`, `extensions/discord/src/approval-handler.runtime.ts:352-357`).
6. At native-runtime expiry, Discord builds a replacement container with no action row and edits the original message. The operator's successful expiry-edit timestamp proves Discord accepted this server-side replacement; it does not prove when a particular client displayed it (`src/infra/approval-handler-runtime.ts:672-703`, `extensions/discord/src/approval-handler.runtime.ts:334-350`, `extensions/discord/src/approval-handler.runtime.ts:490-507`, `extensions/discord/src/approval-handler.runtime.ts:594-609`).
7. A native button click validates the actor, awaits `interaction.acknowledge()`, then resolves over a new operator-approvals Gateway connection. A `plugin:` ID deterministically selects `plugin.approval.resolve`; it does not try exec first (`extensions/discord/src/monitor/exec-approvals.ts:80-127`, `extensions/discord/src/monitor/exec-approvals.ts:134-164`, `src/infra/approval-gateway-resolver.ts:18-52`).

## Native Versus Generic Components

The reported card is a native approval card, not a generic forwarded plugin component:

- Native approval capability explicitly handles both `exec` and `plugin` events and registers `ExecApprovalButton` when Discord native approvals are enabled (`extensions/discord/src/approval-native.ts:171-213`, `extensions/discord/src/monitor/provider.interactions.ts:82-137`).
- Its custom-ID registry key is `execapproval`, parsed directly by the registered native control (`extensions/discord/src/approval-handler.runtime.ts:352-357`, `extensions/discord/src/monitor/exec-approvals.ts:71-82`).
- Generic outbound components use the `occomp` custom-ID family and wildcard agent-component controls (`extensions/discord/src/component-custom-id.ts:34-49`, `extensions/discord/src/component-custom-id.ts:93-112`, `extensions/discord/src/send.components.ts:172-183`).
- Generic plugin interactive callbacks enter `dispatchPluginDiscordInteractiveEvent`; unmatched portable component actions may enter `dispatchDiscordComponentEvent` and `runChannelInboundEvent`, where session/agent work can wait (`extensions/discord/src/monitor/agent-components.plugin-interactive.ts:25-187`, `extensions/discord/src/monitor/agent-components.dispatch.ts:90-115`, `extensions/discord/src/monitor/agent-components.dispatch.ts:266-340`). Native `execapproval` clicks do not enter those paths.

Consequently, generic component session locks or an active agent tool are not an explanation for this native card's callback delay.

## Discord Dispatch And Queue Ownership

The production receive path is:

1. Each websocket `Dispatch` frame starts `handleDispatch` fire-and-forget, so one frame's async completion does not serialize receipt of later frames (`extensions/discord/src/internal/gateway.ts:190-200`, `extensions/discord/src/internal/gateway.ts:273-279`).
2. `handleDispatch` maps the event and awaits `client.dispatchGatewayEvent`. Production sets `autoInteractions: false`, so the gateway wrapper does not invoke a second automatic interaction handler (`extensions/discord/src/internal/gateway.ts:380-400`, `extensions/discord/src/monitor/gateway-plugin.ts:421-427`).
3. `dispatchGatewayEvent` places matching listeners in a global event queue with default concurrency 50 and listener timeout 120 seconds (`extensions/discord/src/internal/client.ts:291-310`, `extensions/discord/src/internal/event-queue.ts:27-53`, `extensions/discord/src/internal/event-queue.ts:105-159`).
4. The sole interaction listener schedules `client.handleInteraction` in a detached microtask and returns. The event-queue slot therefore covers only handoff, not the native handler's acknowledgement, Gateway connection, or resolve RPC (`extensions/discord/src/monitor/listeners.ts:58-76`).
5. Component dispatch resolves the `execapproval` registry entry and awaits `ExecApprovalButton.run`, but that work is already outside the global event-queue job (`extensions/discord/src/internal/interaction-dispatch.ts:80-104`).

### Can the click wait behind active agent execution?

Not through the normal message or interaction listener path. `DiscordMessageListener` also detaches before agent processing, explicitly leaving per-session ordering to the message run queue (`extensions/discord/src/monitor/listeners.ts:36-55`). A tool waiting for approval therefore does not consume the global Discord event queue.

Global event-queue saturation is still mechanically possible if 50 other non-detached listeners are active and the interaction job is pending. Reaction and thread-update listeners do await their work inside the event queue (`extensions/discord/src/monitor/listeners.reactions.ts:57-123`, `extensions/discord/src/monitor/listeners.ts:110-150`). No queue metrics, slow-listener warnings, timeout logs, or inbound interaction timestamp were supplied, so saturation is unsupported for these attempts.

### Awaited boundaries after native handler entry

The native handler has two sequential pre-RPC boundaries:

1. **Discord acknowledgement REST request.** Interaction callback routes are critical-priority. The scheduler favors them over queued standard/background work, but does not preempt up to four active requests, serializes an active bucket, and pauses all queues during a learned global rate limit. Critical requests are not dropped as stale; each active HTTP attempt has a 15-second fetch timeout, and rate-limited requests can be retried up to three times (`extensions/discord/src/internal/rest.ts:73-89`, `extensions/discord/src/internal/rest.ts:148-183`, `extensions/discord/src/internal/rest.ts:223-279`, `extensions/discord/src/internal/rest-scheduler.ts:93-157`, `extensions/discord/src/internal/rest-scheduler.ts:305-343`, `extensions/discord/src/internal/rest-scheduler.ts:399-463`, `extensions/discord/src/internal/rest-scheduler.ts:505-549`).
2. **Fresh Gateway client readiness.** `resolveApprovalOverGateway` creates an operator-approvals client, starts it, waits for `hello`, then sends the resolve request and closes the client (`src/gateway/operator-approvals-client.ts:102-165`, `src/infra/approval-gateway-resolver.ts:19-52`). No timestamps were supplied for resolver entry, Gateway bootstrap, `hello`, or RPC send.

Ordinary REST backlog alone should be reduced by critical priority, but active requests, route/global rate limits, or Gateway readiness can still delay the RPC. None is proven here.

## Routing And Identity

No concrete wrong-Gateway or wrong-client-identity defect is evidenced:

- Tool approval requests omit an explicit URL so `callGateway` selects canonical configured local/remote Gateway details; native delivery and native click resolution use the monitor's config through the same connection-detail builder (`src/agents/tools/gateway.ts:139-164`, `src/gateway/call.ts:1002-1053`, `src/gateway/operator-approvals-client.ts:53-99`, `src/gateway/client-bootstrap.ts:24-57`).
- Local requester and resolver clients carry the process-local approval-runtime token and are accepted as trusted `operator.approvals` runtime clients, which can see requester-bound records (`src/agents/tools/gateway.ts:166-215`, `src/gateway/operator-approvals-client.ts:33-99`, `src/gateway/server/ws-connection/message-handler.ts:1727-1743`, `src/gateway/server-methods/approval-shared.ts:121-155`).
- Remote clients omit the process-local token and load the standard persisted device identity when the option is undefined. Request and resolver clients in the same installation therefore use the same device identity by default (`src/gateway/operator-approvals-client.ts:72-99`, `packages/gateway-client/src/client.ts:536-568`).
- The native runtime had to receive the request event before it could create the reported card. That is direct evidence that native delivery was attached to a Gateway holding a visible record at request time.

A runtime config/environment target change between request and click is mechanically possible because the agent tool dynamically resolves config while the monitor holds its startup config, but no such change is in the supplied evidence. The post-grace timing already explains the exact public error without this hypothesis.

## Cause Classification

| Candidate                                                           | Classification                                              | Evidence                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resolve reached the Gateway after expiry                            | **Proven**                                                  | Resolve arrived `23.771s` after `waitDecision` returned; no pending visible record was found (`src/gateway/server-methods/approval-shared.ts:535-565`).                                                                                            |
| Normal 15-second grace cleanup produced the missing-record response | **Strongly consistent, not independently proven**           | Resolve arrived about `8.771s` after the nominal cleanup deadline. The public response also covers invisible records (`src/gateway/exec-approval-manager.ts:12-26`, `src/gateway/server-methods/approval-shared.ts:91-99`).                        |
| Active agent tool wait blocked the Discord event queue              | **Ruled out for the normal path**                           | Message and interaction listeners detach; production disables duplicate automatic interaction dispatch (`extensions/discord/src/monitor/listeners.ts:36-76`, `extensions/discord/src/monitor/gateway-plugin.ts:421-427`).                          |
| Native click entered generic plugin/session component dispatch      | **Ruled out**                                               | `execapproval` has its own registered component; generic controls use `occomp`/wildcards (`extensions/discord/src/monitor/provider.interactions.ts:127-153`, `extensions/discord/src/component-custom-id.ts:34-49`).                               |
| Discord/client displayed or emitted the click late                  | **Possible, unmeasured**                                    | Message creation and edit acceptance are server-side facts; no client-display or interaction-creation timestamp was supplied.                                                                                                                      |
| Global Discord event queue delayed listener handoff                 | **Mechanically possible, unsupported**                      | Queue is concurrency 50 and can wait behind non-detached listener jobs, but no queue metrics or warnings exist in the evidence (`extensions/discord/src/internal/event-queue.ts:27-53`, `extensions/discord/src/internal/event-queue.ts:105-168`). |
| Awaited interaction acknowledgement delayed resolution              | **Mechanically possible and directly on path, unsupported** | Handler awaits a critical REST callback; critical work can wait on active workers or route/global rate limits, but no acknowledgement/scheduler timestamp was supplied.                                                                            |
| Fresh resolver Gateway connection delayed RPC                       | **Mechanically possible, unsupported**                      | Resolver waits for client readiness before request; no bootstrap/hello timestamps were supplied.                                                                                                                                                   |
| Process-wide event-loop stall for the whole approval window         | **Weak/unsupported**                                        | Timely manager timeout and Discord expiry edit argue against one continuous stall spanning the 120-second window, though shorter stalls cannot be excluded.                                                                                        |
| Wrong Gateway target or invisible requester-bound record            | **Unsupported**                                             | Native request delivery proves initial visibility; local trusted runtime or shared remote device identity is the normal resolver contract. Exact error timing matches cleanup.                                                                     |
| User clicked only after expiry                                      | **Not established**                                         | No authoritative interaction timestamp exists. The evidence must not be used to contradict the user's immediate-click report.                                                                                                                      |

## Minimum Additional Live Evidence

One recurrence needs the following correlated, redacted timestamps. Record wall-clock and monotonic time where possible, plus approval ID and Discord interaction ID; never record tokens or full sensitive payloads.

1. At Discord websocket receipt: `INTERACTION_CREATE` frame receipt time, interaction `id`, source message `id`, and custom-ID key/action. Discord interaction IDs are snowflakes, so the ID also supplies a provider-side creation-time cross-check ([Discord API Reference: Snowflakes](https://docs.discord.com/developers/reference#snowflakes)).
2. At event queue: enqueue time, listener start time, current `queueSize`/`processing`, and detached handoff time. Existing runtime metrics expose event queue depth and processing count (`extensions/discord/src/internal/client.ts:252-256`, `extensions/discord/src/internal/event-queue.ts:71-80`).
3. At native handler: `ExecApprovalButton.run` entry after authorization; acknowledgement enqueue, HTTP start, completion/error timestamps; and REST metrics including `activeWorkers`, critical queue age, `globalRateLimitUntil`, and matching bucket reset (`extensions/discord/src/internal/rest-scheduler.ts:182-218`).
4. At resolver: resolver entry, redacted Gateway URL source, client `hello` readiness, RPC send, and Gateway handler receipt.
5. Retain existing Discord create/edit completion timestamps. Treat them as server acceptance only, not client-display telemetry.

The existing optional websocket capture hook records inbound Discord gateway frames before the wrapper's own message handler (`extensions/discord/src/monitor/gateway-plugin.ts:281-297`). No capture was enabled or read for this investigation. If a future authorized reproduction already uses that facility, the raw frame receipt plus interaction snowflake is the smallest evidence that separates provider/client delay from local dispatch delay.

## Verification

Executed:

```text
pnpm test src/gateway/exec-approval-manager.test.ts src/gateway/server-methods/approval-shared.test.ts src/gateway/server-methods/plugin-approval.test.ts src/gateway/operator-approvals-client.test.ts src/agents/tools/gateway.test.ts src/infra/exec-approval-channel-runtime.test.ts src/infra/approval-handler-runtime.test.ts extensions/discord/src/approval-handler.runtime.test.ts extensions/discord/src/monitor/exec-approvals.test.ts extensions/discord/src/monitor/listeners.test.ts extensions/discord/src/internal/gateway.test.ts extensions/discord/src/monitor/gateway-plugin.test.ts extensions/discord/src/internal/rest.test.ts
```

Result: **passed**, 4 Vitest shards, 20 test files, 299 tests, 20.33 seconds.

The tests prove current fixture contracts for manager expiry/grace, approval visibility, plugin request/wait/resolve, operator client identity, native-runtime expiry/finalization, native Discord cards/buttons, detached listeners, single production interaction handoff, and critical REST scheduling. They do not reproduce the operator's missing interaction receipt or pre-RPC duration, so the causal verdict remains intentionally bounded.
