# Block WA auto-reply delivery for plugin-deliberated channels

## Problem

The thoughtful-response plugin needs to intercept WA group messages and route them through a deliberation pipeline (triage → draft → evaluate → send). But the WA extension has its own message pipeline (`on-message` → `group-gating` → `process-message` → `deliver-reply`) that operates independently from gateway dispatch.

Currently:

- `requireMention: false` → WA extension auto-replies immediately (bad), but plugin hooks fire (good)
- `requireMention: true` → WA extension skips auto-reply (good), but plugin hooks don't fire (bad)
- @mention messages always go through WA extension pipeline regardless of `requireMention`

We need: messages flow through the full pipeline (hooks fire for inbox capture), but delivery is suppressed for deliberation channels.

## Solution

In `process-message.ts`, inside the `deliver` callback passed to `dispatchReplyWithBufferedBlockDispatcher` (around line 406), add a check: if the conversationId matches a plugin-claimed deliberation channel, silently drop the delivery.

The plugin hooks (`message_received`) still fire because `dispatchReplyWithBufferedBlockDispatcher` calls them before delivery. The message enters the plugin inbox, goes through triage → deliberation, and the plugin sends a response later via the `message` tool.

## How to identify deliberation channels

Options (evaluate in planning):

1. Read from plugin config (`plugins.entries.thoughtful-response.config.deliberateChannels`) — couples WA extension to specific plugin
2. Check if any plugin claimed the message via `inbound_claim` hook result (from `warm-peak-1494` fork change) — generic but `inbound_claim` runs in gateway dispatch, not WA extension
3. Add a new config field `channels.whatsapp.groups.<id>.deliveryPolicy: "plugin-only"` — clean, generic, no plugin coupling
4. Use existing `message_sending` hook with `{ cancel: true }` return — already supported by hook system, plugin just needs to register it
5. Check `hookRunner` for registered `inbound_claim` hooks on this channel — combines existing infrastructure

Evaluate which approach is cleanest, most generic, and requires fewest lines changed.

## Config change needed

After implementation: set `requireMention: false` for both WA deliberation groups (so messages flow through full pipeline).

## Files likely changed

- `extensions/whatsapp/src/auto-reply/monitor/process-message.ts` (or deliver-reply.ts) — add delivery check
- Possibly plugin config schema if adding `deliveryPolicy`

## Constraints

- Minimal fork change — prefer reusing existing hook infrastructure over new mechanisms
- Must work for both mention and non-mention messages
- Must not affect non-deliberation groups
- Plugin hooks (`message_received`) MUST still fire
- The deliberation pipeline sends responses via `message` tool (not through WA extension deliver)
