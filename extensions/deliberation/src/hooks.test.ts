import { createServer } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createBeforeToolCallHandler, createMessageSendingHandler } from "./guards.js";
import { createBeforeDispatchHandler, createInboundClaimHandler } from "./intake.js";
import { createKmClient, KmRequestError } from "./km-client.js";

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
const canonicalMessageFacts = {
  provider: "discord",
  eventType: "message",
  eventKind: "user_request",
} as const;

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
  it("keeps configured Discord accounts distinct for the same channel", async () => {
    const routeConfig = parseDeliberationConfig({
      enabled: true,
      failClosed: true,
      sources: [
        { channel: "discord", accountId: "account-a", target: "source" },
        { channel: "discord", accountId: "account-b", target: "source" },
      ],
      processingSource: { channel: "discord", accountId: "account-a", target: "processing" },
      km: config.km,
      restrictedSessionKeys: ["agent:reviewer"],
    });
    const intake = vi.fn().mockResolvedValue({
      recordId: "record-1",
      inboundId: "inbound-1",
      duplicate: false,
    });
    const handler = createInboundClaimHandler(routeConfig, { intake } as never, createLogger());

    for (const [accountId, messageId] of [
      ["account-a", "message-a"],
      ["account-b", "message-b"],
    ] as const) {
      await handler(
        {
          channel: "discord",
          provider: "discord",
          eventType: "message",
          eventKind: "user_request",
          accountId,
          conversationId: "source",
          content: "message",
          isGroup: true,
          messageId,
          senderId: "sender-1",
        },
        {
          channelId: "discord",
          accountId,
          conversationId: "source",
          messageId,
          senderId: "sender-1",
        },
      );
    }

    expect(intake).toHaveBeenCalledTimes(2);
    expect(intake.mock.calls.map(([request]) => request.sourceTarget)).toEqual([
      "v1:discord:account-a:source",
      "v1:discord:account-b:source",
    ]);
  });

  it("keeps two configured channels under one Discord account distinct", async () => {
    const routeConfig = parseDeliberationConfig({
      enabled: true,
      failClosed: true,
      sources: [
        { channel: "discord", accountId: "account-a", target: "source-a" },
        { channel: "discord", accountId: "account-a", target: "source-b" },
      ],
      processingSource: { channel: "discord", accountId: "account-a", target: "processing" },
      km: config.km,
      restrictedSessionKeys: ["agent:reviewer"],
    });
    const intake = vi.fn().mockResolvedValue({
      recordId: "record-1",
      inboundId: "inbound-1",
      duplicate: false,
    });
    const handler = createInboundClaimHandler(routeConfig, { intake } as never, createLogger());

    for (const channelId of ["source-a", "source-b"]) {
      await handler(
        {
          channel: "discord",
          provider: "discord",
          eventType: "message",
          eventKind: "user_request",
          accountId: "account-a",
          conversationId: channelId,
          content: "message",
          isGroup: true,
          messageId: `message-${channelId}`,
          senderId: "sender-1",
        },
        {
          channelId: "discord",
          accountId: "account-a",
          conversationId: channelId,
          messageId: `message-${channelId}`,
          senderId: "sender-1",
        },
      );
    }

    expect(intake.mock.calls.map(([request]) => request.sourceTarget)).toEqual([
      "v1:discord:account-a:source-a",
      "v1:discord:account-a:source-b",
    ]);
  });

  it("persists the live Discord event once through the closed KM wire contract", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T12:50:21.838Z"));
    const allowedHeaders = new Set([
      "host",
      "content-length",
      "connection",
      "user-agent",
      "accept-encoding",
      "sec-fetch-mode",
      "authorization",
      "x-deliberation-protocol-version",
      "accept",
      "content-type",
    ]);
    const records = new Map<string, string>();
    const occurredAtValues: string[] = [];
    const server = createServer((request, response) => {
      let body = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => (body += chunk));
      request.on("end", () => {
        const unexpectedHeaders = Object.keys(request.headers).filter(
          (name) => !allowedHeaders.has(name),
        );
        const event = JSON.parse(body) as { providerEventId: string; occurredAt: string };
        const validRequest =
          request.method === "POST" &&
          request.url === "/deliberation/v1/intake" &&
          request.headers.authorization === "Bearer 0123456789abcdef" &&
          request.headers["x-deliberation-protocol-version"] === "1" &&
          request.headers.accept === "application/json" &&
          request.headers["content-type"] === "application/json" &&
          unexpectedHeaders.length === 0 &&
          event.occurredAt === "2026-08-04T12:50:19.483000Z";
        if (!validRequest) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(
            JSON.stringify({
              protocolVersion: 1,
              error: { code: "SCHEMA_INVALID", message: "headers" },
            }),
          );
          return;
        }
        occurredAtValues.push(event.occurredAt);
        const existing = records.get(event.providerEventId);
        const recordId = existing ?? `record-${records.size + 1}`;
        records.set(event.providerEventId, recordId);
        response.writeHead(existing ? 200 : 201, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            protocolVersion: 1,
            recordId,
            inboundId: `inbound-${event.providerEventId}`,
            duplicate: existing !== undefined,
          }),
        );
      });
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    try {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("missing listener address");
      }
      const listenerConfig = {
        ...config,
        km: { ...config.km, endpoint: `http://127.0.0.1:${address.port}` },
      };
      const client = createKmClient({
        config: listenerConfig,
        openclawConfig: {} as never,
        env: { KM_TOKEN: "0123456789abcdef" },
      });
      const handler = createInboundClaimHandler(listenerConfig, client, createLogger());
      const event = {
        ...canonicalMessageFacts,
        channel: "discord",
        content: "message",
        isGroup: true,
        senderId: "sender-1",
        timestamp: Date.parse("2026-08-04T12:50:19.483Z"),
      };
      const context = { ...sourceContext, messageId: "1534181693647355986" };

      await expect(handler(event, context)).resolves.toEqual({ handled: true });
      await expect(handler(event, context)).resolves.toEqual({ handled: true });
      expect(records).toEqual(new Map([[context.messageId, "record-1"]]));
      expect(occurredAtValues).toEqual([
        "2026-08-04T12:50:19.483000Z",
        "2026-08-04T12:50:19.483000Z",
      ]);
    } finally {
      vi.useRealTimers();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  });

  it("excludes processing before KM intake and never claims", async () => {
    const intake = vi.fn();
    const handler = createInboundClaimHandler(config, { intake } as never, createLogger());
    const result = await handler(
      { ...canonicalMessageFacts, channel: "discord", content: "message", isGroup: true },
      { ...sourceContext, conversationId: "processing", messageId: "m1" },
    );
    expect(result).toEqual({ handled: false });
    expect(intake).not.toHaveBeenCalled();
  });

  it.each([
    { accountId: "default", runtimeTarget: "source" },
    { accountId: "default", runtimeTarget: "channel:source" },
    { accountId: "work", runtimeTarget: "source" },
    { accountId: "work", runtimeTarget: "channel:source" },
  ])(
    "submits canonical source intake for account $accountId and target $runtimeTarget",
    async ({ accountId, runtimeTarget }) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-08-01T12:00:01Z"));
      const routeConfig = parseDeliberationConfig({
        enabled: true,
        failClosed: true,
        sources: [{ channel: "discord", accountId, target: "source" }],
        processingSource: { channel: "discord", accountId, target: "processing" },
        km: config.km,
        restrictedSessionKeys: ["agent:reviewer"],
      });
      const intake = vi.fn().mockResolvedValue({
        recordId: "record-1",
        inboundId: "inbound-1",
        duplicate: true,
      });
      const handler = createInboundClaimHandler(routeConfig, { intake } as never, createLogger());
      await expect(
        handler(
          {
            ...canonicalMessageFacts,
            channel: "discord",
            content: "message",
            isGroup: true,
            senderId: "sender-1",
            timestamp: Date.parse("2026-08-01T12:00:00Z"),
          },
          {
            channelId: "discord",
            accountId,
            conversationId: runtimeTarget,
            messageId: "m1",
          },
        ),
      ).resolves.toEqual({ handled: true });
      expect(intake).toHaveBeenCalledTimes(1);
      expect(intake).toHaveBeenCalledWith({
        provider: "discord",
        providerEventId: "m1",
        sourceTarget: `v1:discord:${accountId}:source`,
        senderId: "sender-1",
        occurredAt: "2026-08-01T12:00:00Z",
        receivedAt: "2026-08-01T12:00:01Z",
        content: "message",
        eventType: "message",
      });
      vi.useRealTimers();
    },
  );

  it.each([
    ["exact second", "2026-08-08T16:23:38.000Z", "2026-08-08T16:23:38Z"],
    ["reported .816Z regression", "2026-08-08T16:23:38.816Z", "2026-08-08T16:23:38.816000Z"],
  ])("sends canonical KM timestamps for a live-shaped %s event", async (_, input, expected) => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(input));
      const bodies: Array<{ occurredAt: string; receivedAt: string }> = [];
      const fetchImpl = vi.fn(
        async (_input: string | URL | Request, init?: RequestInit): Promise<Response> => {
          if (typeof init?.body !== "string") {
            throw new Error("missing intake request body");
          }
          const body = JSON.parse(init.body) as {
            occurredAt: string;
            receivedAt: string;
          };
          bodies.push({ occurredAt: body.occurredAt, receivedAt: body.receivedAt });
          const canonical = [body.occurredAt, body.receivedAt].every(
            (value) =>
              /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{6})?Z$/.test(value) &&
              !value.endsWith(".000000Z"),
          );
          return new Response(
            JSON.stringify(
              canonical
                ? {
                    protocolVersion: 1,
                    recordId: "record-1",
                    inboundId: "inbound-1",
                    duplicate: false,
                  }
                : {
                    protocolVersion: 1,
                    error: { code: "SCHEMA_INVALID", message: "timestamp" },
                  },
            ),
            { status: canonical ? 201 : 400 },
          );
        },
      );
      const client = createKmClient({
        config,
        openclawConfig: {} as never,
        fetchImpl,
        env: { KM_TOKEN: "test-only" },
      });
      const handler = createInboundClaimHandler(config, client, createLogger());

      await expect(
        handler(
          {
            ...canonicalMessageFacts,
            channel: "discord",
            content: "message",
            isGroup: true,
            senderId: "sender-1",
            timestamp: Date.parse(input),
          },
          { ...sourceContext, messageId: "1535684929403359352" },
        ),
      ).resolves.toEqual({ handled: true });
      expect(bodies).toEqual([{ occurredAt: expected, receivedAt: expected }]);
      expect(bodies[0]?.occurredAt).not.toMatch(/\.\d{7,}Z$/);
      expect(bodies[0]?.receivedAt).not.toMatch(/\.\d{7,}Z$/);
    } finally {
      vi.useRealTimers();
    }
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
        ...canonicalMessageFacts,
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
        sourceTarget: "v1:discord:acct:source",
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
      ...canonicalMessageFacts,
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
        ...canonicalMessageFacts,
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
      name: "non-Discord route",
      expectedReason: "ambiguous-route",
      buildConfig: () => config,
      context: { ...sourceContext, channelId: "slack" },
      event: { content: "message", messageId: "m1", senderId: "sender-1" },
    },
    {
      name: "missing account",
      expectedReason: "ambiguous-route",
      buildConfig: () => config,
      context: { channelId: "discord", conversationId: "channel:source" },
      event: { content: "message", messageId: "m1", senderId: "sender-1" },
    },
    {
      name: "missing target",
      expectedReason: "ambiguous-route",
      buildConfig: () => config,
      context: { channelId: "discord", accountId: "acct" },
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

      await handler(
        { ...canonicalMessageFacts, channel: "discord", isGroup: true, ...event },
        context,
      );

      expect(intake).not.toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        `deliberation intake skipped: reason=${expectedReason}`,
      );
    },
  );

  it("warns about KM failure without leaking message or media values", async () => {
    const intake = vi
      .fn()
      .mockRejectedValue(new KmRequestError("http", 400, "SCHEMA_INVALID", "secret message"));
    const logger = createLogger();
    const handler = createInboundClaimHandler(config, { intake } as never, logger);

    await expect(
      handler(
        {
          ...canonicalMessageFacts,
          channel: "discord",
          content: "secret message",
          isGroup: true,
          metadata: { mediaPath: "/private/audio.ogg" },
        },
        { ...sourceContext, messageId: "m1", senderId: "sender-1" },
      ),
    ).resolves.toEqual({ handled: false });

    expect(logger.warn).toHaveBeenCalledWith(
      "deliberation intake failed: reason=km-request-failed stage=http status=400 code=SCHEMA_INVALID error=Error",
    );
    expect(loggedMessages(logger).join("\n")).not.toMatch(/secret message|private\/audio/);
  });

  it("silences but does not intake a source event without a stable message ID", async () => {
    const intake = vi.fn();
    const handler = createInboundClaimHandler(config, { intake } as never, createLogger());
    await expect(
      handler(
        { ...canonicalMessageFacts, channel: "discord", content: "message", isGroup: true },
        sourceContext,
      ),
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
