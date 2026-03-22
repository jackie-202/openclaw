# Plan: Block WA auto-reply delivery for plugin-deliberated channels

## Goals

- Keep WhatsApp group messages flowing through `dispatchReplyWithBufferedBlockDispatcher` so `message_received` hooks still fire.
- Suppress WA auto-delivery only for explicitly marked deliberation groups.
- Leave all non-deliberation chats unchanged (including normal group/DM auto-reply behavior).

## Approach

- Use **option 3**: add a WhatsApp group config flag `deliveryPolicy: "plugin-only" | "auto-reply"` (default `auto-reply`).
- In WA `process-message`, evaluate the group's delivery policy inside the `deliver` callback and silently drop final outbound payloads when policy is `plugin-only`.
- Keep dispatch path intact so hooks and session/meta updates still run.

## Option Evaluation (why this one)

- `plugins.entries.thoughtful-response.config.deliberateChannels`: smallest diff but hard-couples WA extension to one plugin.
- `inbound_claim` result reuse: not available in WA extension pipeline at delivery time.
- `deliveryPolicy` in channel config: generic, explicit, minimal moving parts, no plugin coupling. **Chosen.**
- `message_sending { cancel: true }`: not reliable here because WA auto-reply path uses `deliverWebReply` directly (does not pass through `infra/outbound/deliver.ts` hook pipeline).
- Check only hook registration (`hasHooks("inbound_claim")`): cannot identify which conversation should be suppressed.

## File Changes (planned)

### 1) `src/config/types.whatsapp.ts`

Add group-level delivery policy type.

```diff
 export type WhatsAppGroupConfig = {
   requireMention?: boolean;
+  deliveryPolicy?: "auto-reply" | "plugin-only";
   tools?: GroupToolPolicyConfig;
   toolsBySender?: GroupToolPolicyBySenderConfig;
 };
```

### 2) `src/config/zod-schema.providers-whatsapp.ts`

Allow new config field in strict WhatsApp group schema.

```diff
 const WhatsAppGroupEntrySchema = z
   .object({
     requireMention: z.boolean().optional(),
+    deliveryPolicy: z.enum(["auto-reply", "plugin-only"]).optional(),
     tools: ToolPolicySchema,
     toolsBySender: ToolPolicyBySenderSchema,
   })
```

### 3) `src/config/group-policy.ts`

Extend shared group config surface so WA resolver code can read the new property without casts.

```diff
 export type ChannelGroupConfig = {
   requireMention?: boolean;
+  deliveryPolicy?: "auto-reply" | "plugin-only";
   tools?: GroupToolPolicyConfig;
   toolsBySender?: GroupToolPolicyBySenderConfig;
 };
```

### 4) `extensions/whatsapp/src/auto-reply/monitor/group-activation.ts`

Add helper to resolve effective delivery policy for a group (specific group first, then `*`, then default).

```ts
export function resolveGroupDeliveryPolicyFor(
  cfg: ReturnType<typeof loadConfig>,
  conversationId: string,
): "auto-reply" | "plugin-only" {
  const groupId = resolveGroupSessionKey({
    From: conversationId,
    ChatType: "group",
    Provider: "whatsapp",
  })?.id;
  const { groupConfig, defaultConfig } = resolveChannelGroupPolicy({
    cfg,
    channel: "whatsapp",
    groupId: groupId ?? conversationId,
  });
  return groupConfig?.deliveryPolicy ?? defaultConfig?.deliveryPolicy ?? "auto-reply";
}
```

### 5) `extensions/whatsapp/src/auto-reply/monitor/process-message.ts`

Before calling `deliverWebReply`, short-circuit when group policy is `plugin-only`.

```diff
       deliver: async (payload: ReplyPayload, info) => {
         if (info.kind !== "final") return;
+        if (
+          params.msg.chatType === "group" &&
+          resolveGroupDeliveryPolicyFor(params.cfg, conversationId) === "plugin-only"
+        ) {
+          return;
+        }
         await deliverWebReply({ ... });
         didSendReply = true;
```

Implementation notes:

- Do **not** return early before `dispatchReplyWithBufferedBlockDispatcher`; suppression must happen only at delivery stage.
- Keep `didSendReply = false` when suppressed so return value reflects no WA message sent.

### 6) `extensions/whatsapp/src/auto-reply/monitor/process-message.inbound-context.test.ts`

Add test that confirms dispatch still runs but delivery is dropped for `deliveryPolicy: plugin-only` groups.

```ts
it("suppresses final WA delivery for plugin-only groups while keeping dispatch active", async () => {
  // arrange cfg.channels.whatsapp.groups["123@g.us"].deliveryPolicy = "plugin-only"
  // run processMessage(group msg)
  // extract dispatcherOptions.deliver and invoke with kind=final
  // assert deliverWebReplyMock not called
  // assert dispatch params/captured ctx were produced (pipeline still executed)
});
```

## Config Update After Code Change

- Set both deliberation WA groups to:

```yaml
channels:
  whatsapp:
    groups:
      "<group-jid-1>":
        requireMention: false
        deliveryPolicy: plugin-only
      "<group-jid-2>":
        requireMention: false
        deliveryPolicy: plugin-only
```

## Test Strategy

- Targeted unit test: `pnpm test -- extensions/whatsapp/src/auto-reply/monitor/process-message.inbound-context.test.ts -t "plugin-only"`
- Config/schema regression check (if needed): add/extend config parse test and run `pnpm test -- src/config/config.schema-regressions.test.ts`
- Safety gate before commit: `pnpm check`

## Acceptance Criteria

- WA group message in `plugin-only` group triggers dispatch/hooks but does not send WA auto-reply.
- Mention and non-mention messages behave the same regarding suppression (both suppressed if group is `plugin-only`).
- Non-deliberation groups/DMs keep current delivery behavior.
