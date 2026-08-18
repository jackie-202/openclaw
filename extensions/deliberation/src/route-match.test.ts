import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { admitInboundSource } from "./route-match.js";

const config = parseDeliberationConfig({
  enabled: true,
  failClosed: true,
  sources: [
    { channel: "discord", accountId: "account-a", target: "source" },
    { channel: "discord", accountId: "account-b", target: "source" },
    { channel: "slack", accountId: "workspace-a", target: "C123" },
    { channel: "slack", accountId: "workspace-b", target: "C123" },
    { channel: "slack", accountId: "workspace-a", target: "C456" },
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
      sourceThreadId: "message-1",
      senderId: "sender-1",
    });
  });

  it("keeps a Slack reply's child identity separate from its normalized thread identity", () => {
    expect(
      admitInboundSource(
        config,
        {
          provider: "slack",
          eventType: "message",
          eventKind: "user_request",
          channel: "slack",
          accountId: "workspace-a",
          conversationId: "channel:C123",
          messageId: "1723640000.000200",
          threadId: "1723640000.000100",
          senderId: "U123",
        },
        {
          channelId: "slack",
          accountId: "workspace-a",
          conversationId: "C123",
          messageId: "1723640000.000200",
          senderId: "U123",
        },
      ),
    ).toEqual({
      accepted: true,
      route: { channel: "slack", accountId: "workspace-a", target: "C123" },
      sourceTarget: "v1:slack:workspace-a:C123",
      providerEventId: "1723640000.000200",
      sourceThreadId: "1723640000.000100",
      threadId: "1723640000.000100",
      senderId: "U123",
    });
  });

  it("uses a Slack root message timestamp as both event and thread identity", () => {
    const result = admitInboundSource(
      config,
      {
        provider: "slack",
        eventType: "message",
        eventKind: "user_request",
        channel: "slack",
        accountId: "workspace-b",
        conversationId: "C123",
        messageId: "1723640000.000300",
        senderId: "U123",
      },
      {
        channelId: "slack",
        accountId: "workspace-b",
        conversationId: "C123",
        messageId: "1723640000.000300",
        senderId: "U123",
      },
    );

    expect(result).toMatchObject({
      accepted: true,
      sourceTarget: "v1:slack:workspace-b:C123",
      providerEventId: "1723640000.000300",
      sourceThreadId: "1723640000.000300",
      threadId: "1723640000.000300",
    });
  });

  it.each([
    ["unconfigured account", { accountId: "workspace-c" }, { accountId: "workspace-c" }],
    ["unconfigured channel", { conversationId: "C999" }, { conversationId: "C999" }],
    ["conflicting account", { accountId: "workspace-b" }, {}],
    ["conflicting channel", { conversationId: "C456" }, {}],
    ["conflicting child id", { messageId: "1723640000.000201" }, {}],
    ["conflicting sender", { senderId: "U456" }, {}],
    ["malformed child timestamp", { messageId: "1723640000.bad" }, { messageId: "1723640000.bad" }],
    ["malformed thread timestamp", { threadId: "1723640000.bad" }, {}],
    ["thread later than child", { threadId: "1723640000.000300" }, {}],
  ])("rejects Slack %s", (_name, eventOverrides, contextOverrides) => {
    const slackEvent = {
      provider: "slack",
      eventType: "message",
      eventKind: "user_request",
      channel: "slack",
      accountId: "workspace-a",
      conversationId: "C123",
      messageId: "1723640000.000200",
      threadId: "1723640000.000100",
      senderId: "U123",
    };
    const slackContext = {
      channelId: "slack",
      accountId: "workspace-a",
      conversationId: "C123",
      messageId: "1723640000.000200",
      senderId: "U123",
    };
    expect(
      admitInboundSource(
        config,
        { ...slackEvent, ...eventOverrides },
        { ...slackContext, ...contextOverrides },
      ).accepted,
    ).toBe(false);
  });

  it.each([
    ["processing", { conversationId: "processing" }, { conversationId: "processing" }],
    ["wrong account", { accountId: "other" }, { accountId: "other" }],
    [
      "unsupported provider",
      { provider: "telegram", channel: "telegram" },
      { channelId: "telegram" },
    ],
    ["unsupported event", { eventType: "edit" }, {}],
    ["unsupported kind", { eventKind: "room_event" }, {}],
    ["missing id", { messageId: undefined }, { messageId: undefined }],
    ["conflicting account", { accountId: "account-b" }, {}],
    ["conflicting target", { conversationId: "other" }, {}],
    ["conflicting id", { messageId: "other" }, {}],
    ["malformed id", { messageId: "message:other" }, { messageId: "message:other" }],
    ["oversized id", { messageId: "m".repeat(97) }, { messageId: "m".repeat(97) }],
    ["malformed target", { conversationId: "channel:source:other" }, {}],
    ["non-string target", { conversationId: 123 }, { conversationId: 123 }],
    ["non-string account", { accountId: 123 }, { accountId: 123 }],
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
