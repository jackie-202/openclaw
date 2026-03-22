# WA extension: fire message_received hook even when mention-gated

## Problem

When `requireMention: true` is set for a WA group, `group-gating.ts` skips the message before it reaches `process-message.ts`. This means `dispatchReplyWithBufferedBlockDispatcher` is never called, so plugin hooks (`message_received`) never fire. The thoughtful-response plugin can't capture messages to inbox.

## Solution

In `group-gating.ts`, when a message is skipped due to mention gating (line ~148), fire the `message_received` plugin hook fire-and-forget BEFORE returning `{ shouldProcess: false }`.

This requires passing `hookRunner` (or a callback) into `applyGroupGating`.

### Minimal change approach

Add a callback parameter `onSkippedByMentionGate?: (msg) => void` to `applyGroupGating` params. In `on-message.ts` where `applyGroupGating` is called, pass a callback that fires `message_received` hook. In `group-gating.ts`, call this callback when mention gate skips.

### Alternative: emit in skipGroupMessageAndStoreHistory

The function `skipGroupMessageAndStoreHistory` already stores the message to group history. Add hook emission there.

## Files changed (estimate)

- `extensions/whatsapp/src/auto-reply/monitor/group-gating.ts` (~5 lines)
- `extensions/whatsapp/src/auto-reply/monitor/on-message.ts` (~10 lines to wire callback)

## Why

Without this, `requireMention: true` (the only way to prevent WA auto-reply) also kills inbox capture for the deliberation pipeline. The plugin needs the message even when the agent shouldn't auto-reply.
