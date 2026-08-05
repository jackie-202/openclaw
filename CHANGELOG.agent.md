# Agent Changelog

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
