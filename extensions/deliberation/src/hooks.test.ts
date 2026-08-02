import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createBeforeToolCallHandler, createMessageSendingHandler } from "./guards.js";
import { createBeforeDispatchHandler, createInboundClaimHandler } from "./intake.js";

const config = parseDeliberationConfig({
  enabled: true,
  failClosed: true,
  sources: [{ channel: "discord", accountId: "acct", target: "source" }],
  processingSource: { channel: "discord", accountId: "acct", target: "processing" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
});

const sourceContext = { channelId: "discord", accountId: "acct", conversationId: "source" };

function createLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

function loggedMessages(logger: ReturnType<typeof createLogger>): string[] {
  return [logger.debug, logger.info, logger.warn, logger.error].flatMap((log) =>
    log.mock.calls.map(([message]) => String(message)),
  );
}

describe("deliberation hooks", () => {
  it("excludes processing before KM intake and never claims", async () => {
    const intake = vi.fn();
    const handler = createInboundClaimHandler(config, { intake } as never, createLogger());
    const result = await handler(
      { channel: "discord", content: "message", isGroup: true },
      { ...sourceContext, conversationId: "processing", messageId: "m1" },
    );
    expect(result).toEqual({ handled: false });
    expect(intake).not.toHaveBeenCalled();
  });

  it("submits exact source intake once and claims it", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T12:00:01Z"));
    const intake = vi.fn().mockResolvedValue({
      recordId: "record-1",
      inboundId: "inbound-1",
      duplicate: true,
    });
    const handler = createInboundClaimHandler(config, { intake } as never, createLogger());
    await expect(
      handler(
        {
          channel: "discord",
          content: "message",
          isGroup: true,
          senderId: "sender-1",
          timestamp: Date.parse("2026-08-01T12:00:00Z"),
        },
        { ...sourceContext, messageId: "m1" },
      ),
    ).resolves.toEqual({ handled: true });
    expect(intake).toHaveBeenCalledTimes(1);
    expect(intake).toHaveBeenCalledWith({
      provider: "discord",
      providerEventId: "m1",
      sourceTarget: "acct:source",
      senderId: "sender-1",
      occurredAt: "2026-08-01T12:00:00.000Z",
      receivedAt: "2026-08-01T12:00:01.000Z",
      content: "message",
      eventType: "message",
    });
    vi.useRealTimers();
  });

  it("intakes the canonical Discord channel event shape", async () => {
    const intake = vi.fn().mockResolvedValue({
      recordId: "record-1",
      inboundId: "inbound-1",
      duplicate: false,
    });
    const handler = createInboundClaimHandler(config, { intake } as never, createLogger());

    await handler(
      {
        channel: "discord",
        accountId: "acct",
        conversationId: "channel:source",
        content: "message",
        isGroup: true,
        messageId: "m1",
        senderId: "sender-1",
      },
      {
        channelId: "discord",
        accountId: "acct",
        conversationId: "channel:source",
        messageId: "m1",
        senderId: "sender-1",
      },
    );

    expect(intake).toHaveBeenCalledWith(
      expect.objectContaining({
        providerEventId: "m1",
        sourceTarget: "acct:source",
        content: "message",
      }),
    );
  });

  it("queues and terminally claims the configured Discord source only", async () => {
    const sourceId = "1494265174389948538";
    const exactConfig = parseDeliberationConfig({
      enabled: true,
      failClosed: true,
      sources: [{ channel: "discord", accountId: "default", target: sourceId }],
      processingSource: { channel: "discord", accountId: "default", target: "processing" },
      km: {
        endpoint: "https://km.invalid",
        credential: { source: "env", provider: "default", id: "KM_TOKEN" },
        requestTimeoutMs: 1000,
      },
      restrictedSessionKeys: ["agent:reviewer"],
    });
    const intake = vi.fn().mockResolvedValue({
      recordId: "record-1",
      inboundId: "inbound-1",
      duplicate: false,
    });
    const handler = createInboundClaimHandler(exactConfig, { intake } as never, createLogger());
    const event = {
      channel: "discord",
      accountId: "default",
      conversationId: `channel:${sourceId}`,
      content: "message",
      isGroup: true,
      messageId: "1533408285770649783",
      senderId: "sender-1",
    };

    const result = await handler(event, {
      channelId: "discord",
      accountId: "default",
      conversationId: `channel:${sourceId}`,
      messageId: event.messageId,
      senderId: event.senderId,
    });

    expect(result).toEqual({ handled: true });
    expect(result).not.toHaveProperty("reply");
    expect(intake).toHaveBeenCalledTimes(1);

    await expect(
      handler(
        { ...event, conversationId: "channel:other", messageId: "other-message" },
        {
          channelId: "discord",
          accountId: "default",
          conversationId: "channel:other",
          messageId: "other-message",
          senderId: event.senderId,
        },
      ),
    ).resolves.toEqual({ handled: false });
    expect(intake).toHaveBeenCalledTimes(1);
  });

  it("intakes blank-text audio with a MIME-only placeholder", async () => {
    const intake = vi.fn().mockResolvedValue({
      recordId: "record-1",
      inboundId: "inbound-1",
      duplicate: false,
    });
    const logger = createLogger();
    const handler = createInboundClaimHandler(config, { intake } as never, logger);

    await handler(
      {
        channel: "discord",
        content: "",
        isGroup: true,
        messageId: "m-audio",
        senderId: "sender-1",
        metadata: {
          mediaTypes: ["audio/ogg"],
          mediaPaths: ["/private/spool/secret-audio.ogg"],
        },
      },
      { ...sourceContext, messageId: "m-audio", senderId: "sender-1" },
    );

    expect(intake).toHaveBeenCalledWith(expect.objectContaining({ content: "[media: audio/ogg]" }));
    expect(loggedMessages(logger).join("\n")).not.toContain("/private/spool/secret-audio.ogg");
  });

  it.each([
    {
      name: "disabled config",
      expectedReason: "disabled",
      buildConfig: () =>
        parseDeliberationConfig({
          enabled: false,
          failClosed: true,
          sources: [{ channel: "discord", accountId: "acct", target: "source" }],
          processingSource: { channel: "discord", accountId: "acct", target: "processing" },
          km: {
            endpoint: "https://km.invalid",
            credential: { source: "env", provider: "default", id: "KM_TOKEN" },
            requestTimeoutMs: 1000,
          },
          restrictedSessionKeys: ["agent:reviewer"],
        }),
      context: sourceContext,
      event: { content: "message", messageId: "m1", senderId: "sender-1" },
    },
    {
      name: "processing route",
      expectedReason: "processing-route",
      buildConfig: () => config,
      context: { ...sourceContext, conversationId: "channel:processing" },
      event: { content: "message", messageId: "m1", senderId: "sender-1" },
    },
    {
      name: "unmatched route",
      expectedReason: "unmatched-route",
      buildConfig: () => config,
      context: { ...sourceContext, conversationId: "channel:other" },
      event: { content: "message", messageId: "m1", senderId: "sender-1" },
    },
    {
      name: "missing message id",
      expectedReason: "missing-message-id",
      buildConfig: () => config,
      context: sourceContext,
      event: { content: "message", senderId: "sender-1" },
    },
    {
      name: "missing sender id",
      expectedReason: "missing-sender-id",
      buildConfig: () => config,
      context: { ...sourceContext, messageId: "m1" },
      event: { content: "message" },
    },
    {
      name: "empty content",
      expectedReason: "empty-content",
      buildConfig: () => config,
      context: { ...sourceContext, messageId: "m1", senderId: "sender-1" },
      event: { content: "" },
    },
  ])(
    "logs the $name skip without intake",
    async ({ buildConfig, context, event, expectedReason }) => {
      const intake = vi.fn();
      const logger = createLogger();
      const handler = createInboundClaimHandler(buildConfig(), { intake } as never, logger);

      await handler({ channel: "discord", isGroup: true, ...event }, context);

      expect(intake).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        `deliberation intake skipped: reason=${expectedReason}`,
      );
    },
  );

  it("warns about KM failure without leaking message or media values", async () => {
    const intake = vi.fn().mockRejectedValue(new Error("secret message /private/audio.ogg"));
    const logger = createLogger();
    const handler = createInboundClaimHandler(config, { intake } as never, logger);

    await expect(
      handler(
        {
          channel: "discord",
          content: "secret message",
          isGroup: true,
          metadata: { mediaPath: "/private/audio.ogg" },
        },
        { ...sourceContext, messageId: "m1", senderId: "sender-1" },
      ),
    ).resolves.toEqual({ handled: false });

    expect(logger.warn).toHaveBeenCalledWith(
      "deliberation intake failed: reason=km-request-failed error=Error",
    );
    expect(loggedMessages(logger).join("\n")).not.toMatch(/secret message|private\/audio/);
  });

  it("silences but does not intake a source event without a stable message ID", async () => {
    const intake = vi.fn();
    const handler = createInboundClaimHandler(config, { intake } as never, createLogger());
    await expect(
      handler({ channel: "discord", content: "message", isGroup: true }, sourceContext),
    ).resolves.toEqual({ handled: false });
    expect(intake).not.toHaveBeenCalled();
    expect(createBeforeDispatchHandler(config)({}, sourceContext)).toEqual({ handled: true });
  });

  it("silences exact sources independently of KM", () => {
    expect(createBeforeDispatchHandler(config)({}, sourceContext)).toEqual({ handled: true });
    expect(
      createBeforeDispatchHandler(config)(
        {},
        { ...sourceContext, conversationId: "channel:source" },
      ),
    ).toEqual({ handled: true });
  });

  it("blocks send tools and canonical sends for restricted sessions", () => {
    for (const toolName of ["message", "sessions_send", "sessions_spawn"]) {
      expect(
        createBeforeToolCallHandler(config)({ toolName }, { sessionKey: "agent:reviewer" }),
      ).toMatchObject({ block: true });
    }
    expect(
      createMessageSendingHandler(config)(
        { to: "source" },
        { channelId: "discord", accountId: "acct", sessionKey: "agent:reviewer" },
      ),
    ).toMatchObject({ cancel: true });
  });

  it("keeps source traffic silent while v2 work is disabled", () => {
    const disabled = parseDeliberationConfig({
      enabled: false,
      failClosed: true,
      sources: [{ channel: "discord", accountId: "acct", target: "source" }],
      processingSource: { channel: "discord", accountId: "acct", target: "processing" },
      km: {
        endpoint: "https://km.invalid",
        credential: { source: "env", provider: "default", id: "KM_TOKEN" },
        requestTimeoutMs: 1000,
      },
      restrictedSessionKeys: ["agent:reviewer"],
    });
    expect(createBeforeDispatchHandler(disabled)({}, sourceContext)).toEqual({ handled: true });
  });
});
