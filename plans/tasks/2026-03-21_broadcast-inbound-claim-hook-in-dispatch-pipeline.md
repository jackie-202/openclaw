# Broadcast inbound_claim hook in dispatch pipeline

## Problem

The `inbound_claim` hook exists in the plugin system (`hooks.ts` exports `runInboundClaim`) but is NEVER called in the dispatch pipeline (`dispatch-from-config.ts`). Only the targeted version (`runInboundClaimForPluginOutcome`) is called for plugin-owned conversation bindings.

This means plugins cannot claim/intercept inbound messages before agent dispatch unless they use the heavy conversation-binding mechanism.

## Solution

Add ~8 lines to `dispatch-from-config.ts` to call `hookRunner.runInboundClaim()` (broadcast version) BEFORE the `message_received` fire-and-forget hook (around line 394).

If any plugin returns `{ handled: true }`, short-circuit dispatch (skip agent session reply).

## Exact Location

File: `src/auto-reply/reply/dispatch-from-config.ts`
Insert BEFORE line 394 (the `// Trigger plugin hooks (fire-and-forget)` comment):

```typescript
// Broadcast inbound_claim to all plugins — allows any plugin to claim an
// inbound message before commands / agent dispatch.  The existing targeted
// claim (pluginOwnedBinding path above) handles conversation-bound plugins;
// this covers stateless / channel-scoped plugins that need to intercept
// messages without owning a binding.
if (hookRunner?.runInboundClaim) {
  const broadcastClaimResult = await hookRunner.runInboundClaim(
    inboundClaimEvent,
    inboundClaimContext,
  );
  if (broadcastClaimResult?.handled) {
    // Plugin claimed the message — fire message_received anyway (observability)
    // but skip agent dispatch.
    if (hookRunner.hasHooks("message_received")) {
      fireAndForgetHook(
        hookRunner.runMessageReceived(
          toPluginMessageReceivedEvent(hookContext),
          toPluginMessageContext(hookContext),
        ),
        "dispatch-from-config: message_received plugin hook failed (post-claim)",
      );
    }
    markIdle("plugin_broadcast_claim");
    recordProcessed("completed", { reason: "plugin-broadcast-claimed" });
    return { queuedFinal: false, counts: dispatcher.getQueuedCounts() };
  }
}
```

## Why this is safe

- `runInboundClaim` already exists, is exported, and has full type safety
- It's a "claiming" hook — first plugin to return `{ handled: true }` wins
- No new types, no new exports, no API surface change
- Existing tests don't call broadcast inbound_claim (it was never wired up)
- The `message_received` hook still fires (for observability/inbox capture)

## Consumer (thoughtful-response plugin)

After this change, the plugin adds an `inbound_claim` hook:

```javascript
api.on("inbound_claim", async (event, ctx) => {
  const channelRef = `${ctx.channelId}:${ctx.conversationId}`;
  if (!deliberateChannels.has(channelRef)) return;
  // Write to inbox (same as current message_received logic)
  // ...
  return { handled: true };
});
```

This replaces the need for `requireMention: true` as the gate mechanism.

## Files changed

- `src/auto-reply/reply/dispatch-from-config.ts` (~15 lines added)

## Testing

- Existing tests pass (no broadcast claim was wired, so no behavior change for unclaimed messages)
- New test: plugin with inbound_claim returning `{ handled: true }` → dispatch returns without agent reply
