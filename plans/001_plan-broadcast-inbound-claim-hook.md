# Plan: Broadcast inbound_claim hook

## Steps

1. Open `src/auto-reply/reply/dispatch-from-config.ts`
2. Find the comment `// Trigger plugin hooks (fire-and-forget)` (around line 394)
3. Insert the broadcast inbound_claim block BEFORE that comment (after the pluginOwnedBinding section ends)
4. The block:
   - Calls `hookRunner.runInboundClaim(inboundClaimEvent, inboundClaimContext)`
   - If result is `{ handled: true }`:
     - Still fires `message_received` hook (fire-and-forget, for observability)
     - Calls `markIdle("plugin_broadcast_claim")`
     - Calls `recordProcessed("completed", { reason: "plugin-broadcast-claimed" })`
     - Returns early `{ queuedFinal: false, counts: dispatcher.getQueuedCounts() }`
5. Run `pnpm build` to verify TypeScript compilation
6. Run existing dispatch-from-config tests: `pnpm test src/auto-reply/reply/dispatch-from-config.test.ts`
7. Add one test case: mock plugin with inbound_claim returning `{ handled: true }` → verify dispatch short-circuits

## Constraints

- NO new types (PluginHookInboundClaimResult already exists)
- NO new exports
- Keep the change under 20 lines of production code
- The `message_received` hook MUST still fire even when claimed (plugin inbox capture depends on it)
