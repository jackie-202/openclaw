import type { PluginHookInboundClaimEvent } from "openclaw/plugin-sdk/plugin-entry";
import type { DeliberationConfig } from "./config.js";
import type { KmClient } from "./km-client.js";
import { matchesProcessing, matchesSource } from "./route-match.js";

type InboundContext = {
  channelId?: string;
  accountId?: string;
  conversationId?: string;
  messageId?: string;
  senderId?: string;
  sessionKey?: string;
};

export function createInboundClaimHandler(config: DeliberationConfig, client: KmClient) {
  return async (event: PluginHookInboundClaimEvent, ctx: InboundContext) => {
    if (!config.enabled || matchesProcessing(config, ctx) || !matchesSource(config, ctx)) {
      return { handled: false };
    }
    const messageId = ctx.messageId ?? event.messageId;
    const senderId = ctx.senderId ?? event.senderId;
    if (!messageId || !senderId || !event.content) {
      return { handled: false };
    }
    try {
      const receivedAt = new Date().toISOString();
      await client.intake({
        provider: "discord",
        providerEventId: messageId,
        sourceTarget: `${ctx.accountId}:${ctx.conversationId}`,
        senderId,
        occurredAt: new Date(event.timestamp ?? Date.now()).toISOString(),
        receivedAt,
        content: event.content,
        eventType: "message",
      });
    } catch {
      // Intake is fail-closed by the independent before_dispatch hook.
    }
    return { handled: false };
  };
}

export function createBeforeDispatchHandler(config: DeliberationConfig) {
  // Config/KM disablement stops v2 work, but source silence remains fail-closed;
  // otherwise an outage or cutover pause would leak pilot traffic to ordinary dispatch.
  return (_event: unknown, ctx: InboundContext) =>
    matchesSource(config, ctx) ? { handled: true } : undefined;
}
