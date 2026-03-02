# Task: Implement Two-Phase LLM Gate for Group Chats

## Context

This is a fork of OpenClaw (AI assistant gateway). In group chats with `activation: always` mode, every incoming message triggers a full LLM run. This causes the AI to repeat itself 7-8x because it generates a fresh response each time without properly checking what it already said.

## What to Build

A two-phase LLM gate that intercepts group messages BEFORE the main LLM run:

**Phase 1 (Gate):** A cheap/fast model call that reads the conversation history + new message and decides: should I respond? (yes/no + reason)
**Phase 2 (Response):** Only if Phase 1 says yes — the normal LLM run proceeds as usual.

## Architecture

```
Incoming group message
    ↓
[existing debounce + gating passes]
    ↓
Phase 1 — GATE (cheap model, e.g. gpt-4o-mini)
  Input: last N messages from session (including own replies) + new message
  Prompt: structured decision prompt (see below)
  Output: { shouldRespond: boolean, reason: string }
    ↓
shouldRespond === false → skip processMessage, store for context
shouldRespond === true  → continue to processMessage (normal flow)
```

## Where to Insert the Gate

File: `src/web/auto-reply/monitor/on-message.ts`

In the `createWebOnMessageHandler` return function, AFTER `applyGroupGating()` returns `shouldProcess: true` and BEFORE `processForRoute()` is called. Around line 130-140 in on-message.ts:

```typescript
// CURRENT CODE:
if (!gating.shouldProcess) {
  return;
}
// ... broadcast check ...
await processForRoute(msg, route, groupHistoryKey);

// DESIRED:
if (!gating.shouldProcess) {
  return;
}

// NEW: Two-phase gate for always-on groups
if (activation === "always") {
  const gateResult = await runGroupGate({...});
  if (!gateResult.shouldRespond) {
    // Store message for context but don't trigger LLM run
    recordPendingGroupHistoryEntry({...});
    return;
  }
}

// ... broadcast check ...
await processForRoute(msg, route, groupHistoryKey);
```

## Key Files to Understand

1. `src/web/auto-reply/monitor/on-message.ts` — Main handler, this is where you insert the gate
2. `src/web/auto-reply/monitor/group-gating.ts` — Existing gating logic (allowlist, mention detection)
3. `src/auto-reply/reply/groups.ts` — buildGroupIntro(), buildGroupChatContext()
4. `src/auto-reply/reply/get-reply-run.ts` — runPreparedReply(), where main LLM run happens
5. `src/config/config.ts` — Config loading
6. `src/config/zod-schema.providers-whatsapp.ts` — WhatsApp config schema (for adding gate config)

## New Config Schema

Add to WhatsApp group entry schema and/or agents.defaults:

```json
{
  "agents": {
    "defaults": {
      "groupGate": {
        "enabled": true,
        "model": "copilot/gpt-4o-mini",
        "historyLimit": 20,
        "timeoutMs": 10000
      }
    }
  }
}
```

## Gate Implementation Details

### New file: `src/auto-reply/reply/group-gate.ts`

The gate function needs to:

1. Read the session file (JSONL) to get recent conversation history
2. Format it as a readable transcript (sender: message)
3. Call a cheap LLM with a structured prompt
4. Parse the yes/no response
5. Return { shouldRespond: boolean, reason: string }

### Gate Prompt (critical — this is the core logic)

```
You are a group chat response gate. Your ONLY job is to decide whether the AI assistant should respond to the latest message.

## Conversation History (last N messages):
[formatted transcript]

## New Message:
[sender]: [message]

## Rules — respond YES only if:
- The message is a direct question or request TO the assistant
- The assistant was mentioned by name
- The assistant has genuinely new information to add
- Someone is replying to something the assistant said, with a follow-up question

## Rules — respond NO if:
- The assistant already answered this question/topic
- The message is just an emoji, reaction, or short acknowledgment (ok, jo, jojo, :D, 🫡, etc.)
- It's banter between other people that doesn't involve the assistant
- It's a meta-comment ABOUT the assistant (not TO the assistant)
- The assistant would just be repeating what it already said
- The message is a link the assistant can't access (and nobody asked for analysis)

## Response Format (JSON only, no other text):
{"shouldRespond": true/false, "reason": "brief explanation"}
```

### Reading Session History

You need to read the session JSONL file to get conversation history. Look at how `applySessionHints()` or session loading works in the codebase. The session file path can be resolved via `resolveSessionFilePath()`.

Each line in the JSONL is a message object. You need the last N messages with role "user" and "assistant", extracting the text content.

### Model Call

Look at how OpenClaw calls LLM models internally. You likely need to use the same provider infrastructure. Check:

- `src/providers/` for model call abstractions
- How `runReplyAgent()` calls the model
- There might be a simpler "completion" or "chat" API you can use for the gate (it doesn't need tools, just text in → text out)

### Fallback Behavior

- If gate call fails (timeout, error) → default to shouldRespond=true (safe fallback)
- If gate model is not configured → skip gate entirely (backward compatible)
- Log gate decisions for debugging (use existing logger infrastructure)

## Config Schema Changes

In `src/config/zod-schema.providers-whatsapp.ts`, the `WhatsAppGroupEntrySchema` does NOT need to change (gate is global, not per-group).

Add the gate config under agents defaults schema. Find where `AgentDefaultsSchema` is defined and add:

```typescript
groupGate: z.object({
  enabled: z.boolean().optional(),
  model: z.string().optional(),
  historyLimit: z.number().int().min(1).optional(),
  timeoutMs: z.number().int().min(1000).optional(),
}).strict().optional(),
```

## Testing

After implementation:

1. `pnpm build` must pass
2. Basic type checking: `pnpm tsgo` or `tsc --noEmit`
3. Add a simple unit test in `src/auto-reply/reply/group-gate.test.ts`

## Important Notes

- This is a private fork, no upstream PR needed
- Keep changes minimal and focused
- Don't modify existing behavior for non-group or mention-mode chats
- The gate only activates for `activation === "always"` group sessions
- Use existing logging patterns (look for `logVerbose` usage)
