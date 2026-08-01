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

describe("deliberation hooks", () => {
  it("excludes processing before KM intake and never claims", async () => {
    const intake = vi.fn();
    const handler = createInboundClaimHandler(config, { intake } as never);
    const result = await handler(
      { channel: "discord", content: "message", isGroup: true },
      { ...sourceContext, conversationId: "processing", messageId: "m1" },
    );
    expect(result).toEqual({ handled: false });
    expect(intake).not.toHaveBeenCalled();
  });

  it("submits exact source intake once and remains non-claiming", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T12:00:01Z"));
    const intake = vi.fn().mockResolvedValue({
      recordId: "record-1",
      inboundId: "inbound-1",
      duplicate: true,
    });
    const handler = createInboundClaimHandler(config, { intake } as never);
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
    ).resolves.toEqual({ handled: false });
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

  it("silences but does not intake a source event without a stable message ID", async () => {
    const intake = vi.fn();
    const handler = createInboundClaimHandler(config, { intake } as never);
    await expect(
      handler({ channel: "discord", content: "message", isGroup: true }, sourceContext),
    ).resolves.toEqual({ handled: false });
    expect(intake).not.toHaveBeenCalled();
    expect(createBeforeDispatchHandler(config)({}, sourceContext)).toEqual({ handled: true });
  });

  it("silences exact sources independently of KM", () => {
    expect(createBeforeDispatchHandler(config)({}, sourceContext)).toEqual({ handled: true });
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
