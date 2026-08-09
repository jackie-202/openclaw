import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { admitInboundSource } from "./route-match.js";

const config = parseDeliberationConfig({
  enabled: true,
  failClosed: true,
  sources: [
    { channel: "discord", accountId: "account-a", target: "source" },
    { channel: "discord", accountId: "account-b", target: "source" },
  ],
  processingSource: { channel: "discord", accountId: "account-a", target: "processing" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
});

const event = {
  provider: "discord",
  eventType: "message",
  eventKind: "user_request",
  channel: "discord",
  accountId: "account-a",
  conversationId: "channel:source",
  messageId: "message-1",
  senderId: "sender-1",
};
const context = {
  channelId: "discord",
  accountId: "account-a",
  conversationId: "source",
  messageId: "message-1",
  senderId: "sender-1",
};

describe("Deliberation source admission", () => {
  it("accepts one exact configured source identity", () => {
    expect(admitInboundSource(config, event, context)).toEqual({
      accepted: true,
      route: { channel: "discord", accountId: "account-a", target: "source" },
      sourceTarget: "v1:discord:account-a:source",
      providerEventId: "message-1",
      senderId: "sender-1",
    });
  });

  it.each([
    ["processing", { conversationId: "processing" }, { conversationId: "processing" }],
    ["wrong account", { accountId: "other" }, { accountId: "other" }],
    ["unsupported provider", { provider: "slack", channel: "slack" }, { channelId: "slack" }],
    ["unsupported event", { eventType: "edit" }, {}],
    ["unsupported kind", { eventKind: "room_event" }, {}],
    ["missing id", { messageId: undefined }, { messageId: undefined }],
    ["conflicting account", { accountId: "account-b" }, {}],
    ["conflicting target", { conversationId: "other" }, {}],
    ["conflicting id", { messageId: "other" }, {}],
    ["malformed target", { conversationId: "channel:source:other" }, {}],
    ["missing provider", { provider: undefined }, {}],
    ["missing event", { eventType: undefined }, {}],
    ["missing kind", { eventKind: undefined }, {}],
  ])("rejects %s", (_name, eventOverrides, contextOverrides) => {
    expect(
      admitInboundSource(
        config,
        { ...event, ...eventOverrides },
        { ...context, ...contextOverrides },
      ).accepted,
    ).toBe(false);
  });
});
