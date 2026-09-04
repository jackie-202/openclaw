# Agent Changelog

## 2026-08-31

**Slack Deliberation freshness now sees newer top-level channel messages**

Freshness evaluation now includes newer top-level channel messages, so channel activity advances the deliberation freshness signal instead of being ignored.

## 2026-08-30

**Trusted Discord sender names are preserved in Deliberation intake**

The Deliberation listener request now carries the opaque sender ID together with bounded display-name and username indicators when trusted sender metadata is present. That keeps the identity-resolution signal available instead of stripping it away at intake.

**Deliberation intake keeps trusted sender names with the opaque ID**

A Discord event with trusted sender metadata now reaches the Deliberation listener request with the opaque sender ID plus bounded display-name and username indicators. That preserves the trusted identity signal for People Intel resolution instead of collapsing the payload to ID-only data.

## 2026-08-26

**OpenClaw removes its reverse dependency on KM Deliberation source layout**

## 2026-08-25

**Slack Deliberation history read now uses the configured channel**

The history-read path is bound to the configured Slack channel for the deliberation flow, so lookups follow the intended channel configuration.

**Discord root-channel deliveries route without threadId**

Ordinary Discord root-channel deliveries are handled on the root channel path instead of requiring a threadId, removing the production Unknown Channel failure for root-post delivery.

**Deliberation Discord idempotency keys are capped at 25 characters**

The Deliberation Discord path now constrains the provider idempotency key to 25 characters, matching the downstream limit called out in the evidence. This makes the built runtime align with the accepted delivery boundary instead of emitting overlong keys.

**Discord idempotency keys stay within the 25-character limit**

The deliberation final-delivery path now constrains the Discord idempotency key to the platform's 25-character limit, preventing overlong keys from reaching the API and being rejected.

**Deliberation plugin completes KM requests instead of failing**

The plugin's KM request path now returns successfully instead of aborting with a failure at request time.

## 2026-08-24

**Deliberation final-delivery service registers one owner and processes one ready item per tick**

When Deliberation is enabled, the plugin registers exactly one `deliberation-final-delivery` service; when disabled, it registers none. Each service tick handles at most one ready item, keeping the delivery loop single-step and bounded.

## 2026-08-23

**OpenClaw Deliberation converges on the canonical KM owner behind a cross-repository gate**

**OpenClaw Deliberation closes the exclusive-ownership channel boundary**

**Doctor migrates legacy config to canonical `pipelines[]` and rejects mixed authority**

Legacy config is converted into canonical `pipelines[]` instead of leaving dual authority in place. If a config mixes legacy and new sources, the migration fails closed rather than guessing which source wins.

## 2026-08-22

**One-event intake preserves safe uncertain-delivery semantics**

The delivery flow keeps intake to a single authenticated event and preserves the safe handling path for uncertain deliveries. This delivery is about the pipeline boundary itself: one event enters per delivery, and uncertain outcomes stay in the guarded branch instead of being collapsed into a misleading success path.

**Exclusive deliberation ownership gates channel side effects**

A configured source is handled under exclusive deliberation ownership before any ordinary acknowledgement, typing, auto-thread, assistant-dispatch, or fallback side effects. The delivery closes the side-effect boundary around the configured source path instead of letting those channel actions fire first.

## 2026-08-21

**Per-pipeline deliberation routes source-default replies**

Deliberation is routed per pipeline, and the source-default reply path is delivered from that routed decision flow.

**Source-specific deliberation returns the source default reply**

Requests are routed through the matching source-specific deliberation flow, and the reply comes from that source's default response instead of a shared path.

**Deliberation pipeline identity carries through intake**

The intake path now supplies deliberation pipeline identity and effective target to downstream processing, and the effective target is kept immutable.

**Deliberation pipeline config adds legacy normalization**

The deliberation pipeline definition now includes explicit config plus normalization for legacy inputs, so older source shapes map into the current pipeline structure instead of remaining ad hoc. This establishes the config-driven path as the operative boundary for both new and legacy records.

## 2026-08-20

**OpenAI compaction accepts local bridge OAuth auth**

Provider-auth validation no longer rejects the supported local bridge/OAuth arrangement with the quoted OAuth-vs-API-key error. Normal OpenAI provider initialization and compaction can proceed under that auth path.

## 2026-08-18

**READY_TO_SEND deliberations reach the sole-send delivery path**

Deliberation records in READY_TO_SEND now flow into the sole-send delivery path. The delivery no longer stops those records short of send execution, so the state transition leads to the intended downstream delivery instead of being dropped before dispatch.

**Aligns OpenClaw with the provider-neutral Deliberation owner contract**

The shared OpenClaw wire now follows provider-neutral owner semantics, while provider-specific rules remain in OpenClaw-owned overlays and adapters.

## 2026-08-17

**Deliberation owner pin refresh separates semantic comparison from byte and hash checks**

The refreshed `provenance.json` records the current exact owner revision and current exact owner file hashes, while semantic comparison is evaluated separately from byte and hash comparison.

**Deliberation draft continuations bind to the current attempt payload**

Draft continuation lookup now uses the active attempt payload instead of reusing prior attempt state, preventing continuations from drifting across attempts.

**Draft continuations pin to the current attempt payload**

Deliberation draft continuation resolution is now bound to the current attempt payload, so follow-on continuations stay attached to the same attempt data instead of drifting across older payload state.

## 2026-08-16

**Slack-native final delivery adapter sends through the canonical Slack transport**

Final delivery routes now go through the established Slack transport to the exact account, channel, and thread. Both Slack-to-Slack and Discord-to-Slack paths use the same canonical destination handling and send once through that transport.

**Slack-to-Discord pilot sends each ready item once to its canonical Discord destination**

A Slack-origin ready item is delivered to its configured Discord account, channel, and thread with exactly one Discord send. The destination is resolved from the canonical Discord target rather than the source, so the pilot uses one outbound path per ready item instead of duplicating sends.

**Slack intake normalizes thread identity and uses the message timestamp as providerEventId**

Configured Slack roots and replies are admitted through the same intake path. providerEventId is derived from the actual Slack message timestamp, and the thread identity is normalized from the Slack thread fields so root and reply events land in one conversation boundary.

## 2026-08-14

**Deliberation plugin accepts an optional final delivery target override**

The plugin can now take an optional override for the final delivery target, letting the last handoff be redirected without changing the rest of the deliberation flow.

## 2026-08-13

**Deliberation final sender wired into live plugin runtime**

The existing Deliberation final sender is now connected to the live plugin runtime, so the final-sender path runs as part of normal production execution instead of remaining detached from it.

## 2026-08-09

**Deliberation intake canonicalizes timestamp serialization**

**Canonical UTC timestamp serialization for Deliberation intake**

Date values are serialized in canonical UTC form with fractional seconds preserved when present: `2026-08-08T16:23:38.816Z` becomes `2026-08-08T16:23:38.816000Z`, while whole-second input `2026-08-08T16:23:38.000Z` stays compact as `2026-08-08T16:23:38Z`.

## 2026-08-07

**Deliberation final-provider resolution is confined to one plugin adapter**

Deliberation v2 final-provider selection is routed through the plugin-confined adapter, removing alternate final-provider paths.

## 2026-08-06

**Deliberation producer admission is account-aware**

Admission checks now use account context when deciding whether a producer can enter the deliberation flow, instead of treating admission as global.

## 2026-08-04

**Live intake timestamps normalized to canonical UTC Z format**

Live-shaped intake events now emit canonical UTC timestamps at whole-second precision as `...ssZ` for both `occurred` and `received` where applicable. Fractional timestamps continue through the existing non-zero fractional path, so the canonicalization only applies when the source time lands exactly on a second boundary.

## 2026-08-03

**Deliberation plugin registers its runtime entry in the built checkout**

`openclaw plugins list --json` now reports Deliberation with its expected hooks from the built runtime entry instead of `hookCount: 0`. The plugin entry is wired into the checkout used at runtime, so the extension is discoverable with its hook registration intact.

**Discord deliberation intake canonicalizes pilot-channel sourceTarget**

Configured pilot-channel inbound events now emit an intake body with the exact `sourceTarget: discord:channel:1494265174389948538` value, matching the canonical Discord channel target expected by the deliberation intake path.

## 2026-08-02

**Node fetch transport metadata no longer triggers HTTP 400**

Requests carrying standard automatic transport metadata from Node `fetch` are no longer rejected with HTTP 400 solely for those headers. The compatibility fix narrows the failure condition to the request content instead of the client-generated transport header set.

**Discord deliberation intake now reaches createInboundClaimHandler for channel 1494265174389948538**

A realistic Discord event from channel 1494265174389948538 is wired through the inbound hook into `createInboundClaimHandler` and KM intake. The integration path now proves a successful intake for the live deliberation event instead of stopping before handler entry.

**Discord source-channel claims enqueue silently**

A claim matching `channel=discord` and `accountId=default` is accepted and queued through the deliberation intake path. The delivery centers on the enqueue path for a realistic source-channel claim rather than a noisy claim response.

## 2026-08-01

**Deliberation plugin accepts loopback HTTP endpoints in `km.endpoint`**

Loopback HTTP targets are now valid input to the `km.endpoint` schema.

## 2026-07-31

**Deliberation v2 makes KM authority the fork wire contract**

The delivery removes the fork-specific `x-deliberation-protocol`, `/deliveries`, `/attempts`, and `/control` surface from the extension and reference docs, leaving KM authority as the contract boundary.

## 2026-07-28

**Deliberation v2 plugin consumes the accepted KM wire**

The Deliberation v2 plugin now consumes the accepted KM wire contract directly.

## 2026-07-27

**Standard plugin intake with silent, bounded final delivery**

## 2026-07-24

**Fork runtime profile rejects `model` and removes the transitional fallback**

The fork runtime profile no longer accepts a `model` override through the transitional path. That fallback is removed, so `model` is rejected directly and the profile authority is now explicit instead of being inferred from legacy behavior.

**Upstream model authority with transitional fallback**

Model authority is taken from the upstream source during this slice, while a transitional fallback remains in place for compatibility during the cutover. The delivery changes which side owns the decision path without removing the fallback yet, so the system can move authority upstream without a hard switch.

## 2026-07-19

**Fork-only trajectory batched writer and cron opt-out removed**

The fork-specific batched writer path is removed, along with the cron trajectory opt-out that bypassed the normal trajectory flow.

**Remove legacy channels.modelByChannel support from the fork**

## 2026-07-13

**`channels.runtimeByChannel` now applies to fresh Discord channel sessions**

New Discord channel sessions resolve `channels.runtimeByChannel` at startup instead of missing the channel-specific mapping. Resolution follows the documented precedence chain: session override, runtime profile, legacy channel model, then global default, so a fresh session picks the channel-bound runtime configuration before falling back to broader sources.

## 2026-07-01

**OpenAI-compatible completions forwards configured `reasoningEffort` unchanged**

The OpenAI-compatible completion path now passes the configured provider-facing `reasoningEffort` string through without normalization or rewriting, so the value reaches the upstream provider exactly as set.

## 2026-06-10

**Strict-agentic promise-only actionable turns retry before finalizing**

In `src/agents/embedded-agent-runner/run/incomplete-turn.ts`, actionable turns that still belong to the strict-agentic promise-only path now go back through retry handling instead of being finalized as complete. The change stays inside the existing runner flow and preserves incomplete-turn handling for this specific turn shape.

## 2026-06-09

**OpenClaw ships `global-agent` in runtime dependency metadata and lockfiles**

Added `global-agent` to the runtime dependency set and regenerated the lockfiles so the CLI can resolve the proxy lifecycle import from the shipped package boundary instead of failing on a missing module.

## 2026-06-04

**channels.runtimeByChannel persists Discord model, thinking, reasoning, and verbosity**

Before, `channels.modelByChannel` only preserved the model, so reconstructed Discord channel sessions could come back as `openai/gpt-5.5` but lose `thinkingLevel`, `reasoningLevel`, and text verbosity. The new `channels.runtimeByChannel.discord.<channelId>` profile stores the full runtime tuple and resolves it as effective channel state, so `#einstein-mode` keeps `Think: xhigh` and `Reasoning: on` after session reconstruction. `channels.modelByChannel` remains the legacy model-only alias.

## 2026-05-04

**WhatsApp login error builder avoids TypeError on malformed login results**

`extensions/whatsapp/src/login.ts` now uses a local fallback error builder when `waitForWhatsAppLoginResult` returns a malformed shape. Instead of throwing a `TypeError` while reading missing fields, the login failure path stays in normal error handling and surfaces a fallback `Error` for invalid results.

## 2026-05-03

**Cron AgentTurn payload adds `trajectory` opt-out**

Adds `trajectory?: boolean` to the cron `agentTurn` payload type. The per-run trajectory default is resolved from the cron payload after `agentPayload` exists, then the resolved flag is passed into `agentTurn`.
