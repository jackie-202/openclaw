# Plan: Fire message_received hook on mention-gated WA messages

## Goal

When `requireMention: true` causes a WA group message to be skipped (no mention), still fire the `message_received` plugin hook so that plugins like `thoughtful-response` can capture the message.

## Steps

1. **group-gating.ts** — Add an optional callback `onMentionGateSkip` to `applyGroupGating` params:

   ```typescript
   onMentionGateSkip?: (msg: WebInboundMessage) => void;
   ```

2. **group-gating.ts** — In `skipGroupMessageAndStoreHistory`, call this callback if provided:

   ```typescript
   params.onMentionGateSkip?.(params.msg);
   ```

   Call it only when the skip reason is mention gating (not other skips like group policy or activation commands).

3. **on-message.ts** — When calling `applyGroupGating`, pass the callback that fires `message_received` hook:

   ```typescript
   onMentionGateSkip: (msg) => {
     const hookRunner = getGlobalHookRunner();
     if (hookRunner?.hasHooks("message_received")) {
       fireAndForgetHook(
         hookRunner.runMessageReceived(
           toPluginMessageReceivedEvent(msg),
           toPluginMessageContext(msg),
         ),
         "on-message: message_received hook (mention-gated)",
       );
     }
   };
   ```

4. **Imports** — Add necessary imports for `getGlobalHookRunner`, `fireAndForgetHook`, `toPluginMessageReceivedEvent`, `toPluginMessageContext` to on-message.ts.

5. **Build** — `pnpm build`

6. **Test** — Send message to WA group with `requireMention: true`, verify:
   - No auto-reply from WA extension
   - Inbox file created by plugin

## Constraints

- DO NOT change the skip behavior — message must still be skipped from auto-reply
- DO NOT change group-gating return values
- The callback is fire-and-forget — failures must not affect gating logic
- Keep changes minimal (<20 lines)
