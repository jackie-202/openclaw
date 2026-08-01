import type { DeliberationConfig } from "./config.js";
import { matchesSource } from "./route-match.js";

export const SEND_CAPABLE_TOOLS = new Set([
  "message",
  "send_message",
  "discord_send",
  "message_send",
  "sessions_send",
  "sessions_spawn",
]);

export function createBeforeToolCallHandler(config: DeliberationConfig) {
  return (event: { toolName: string }, ctx: { sessionKey?: string }) => {
    if (
      ctx.sessionKey &&
      config.restrictedSessionKeySet.has(ctx.sessionKey) &&
      SEND_CAPABLE_TOOLS.has(event.toolName)
    ) {
      return { block: true, blockReason: "Deliberation restricted sessions cannot send messages" };
    }
    return undefined;
  };
}

export function createMessageSendingHandler(config: DeliberationConfig) {
  return (
    event: { to: string },
    ctx: { channelId: string; accountId?: string; sessionKey?: string },
  ) => {
    if (
      ctx.sessionKey &&
      config.restrictedSessionKeySet.has(ctx.sessionKey) &&
      matchesSource(config, { ...ctx, target: event.to })
    ) {
      return { cancel: true, cancelReason: "Deliberation source delivery requires a KM attempt" };
    }
    return undefined;
  };
}
