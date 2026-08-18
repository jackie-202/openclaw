import type { OpenClawConfig } from "openclaw/plugin-sdk/discord";
import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createHistoryReadHandler } from "./history-read.js";

const config = parseDeliberationConfig({
  enabled: true,
  failClosed: true,
  sources: [
    { channel: "discord", accountId: "acct-a", target: "channel-1" },
    { channel: "discord", accountId: "acct-b", target: "channel-1" },
    { channel: "discord", accountId: "acct-a", target: "channel-2" },
    { channel: "slack", accountId: "workspace-a", target: "C123" },
    { channel: "slack", accountId: "workspace-b", target: "C123" },
    { channel: "slack", accountId: "workspace-a", target: "C456" },
  ],
  processingSource: { channel: "discord", accountId: "acct-a", target: "processing" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
});

const request = {
  schemaVersion: 1,
  sourceTarget: "v1:discord:acct-b:channel-1",
  before: "pending-1",
  limit: 20,
};

describe("Deliberation history read", () => {
  it("reads the exact account and channel and normalizes chronological history", async () => {
    const readMessages = vi.fn(async () => [
      { id: "2", content: "later", timestamp: "2026-08-07T12:00:02Z", author: { id: "u" } },
      {
        id: "1",
        content: "bot",
        timestamp: "2026-08-07T12:00:01Z",
        author: { id: "b", bot: true },
      },
    ]);
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {} as OpenClawConfig,
      readMessages,
    });

    const result = await handler(request);

    expect(readMessages).toHaveBeenCalledWith(
      "channel-1",
      { limit: 20, before: "pending-1" },
      { cfg: {}, accountId: "acct-b" },
    );
    expect(result.provenance).toEqual({
      provider: "discord",
      account: "acct-b",
      channel: "channel-1",
    });
    expect(
      result.messages.map((message) => [message.providerEventId, message.senderIsBot]),
    ).toEqual([
      ["1", true],
      ["2", false],
    ]);
  });

  it.each([0, 1, 20, 21])("accepts %i provider messages and caps output at 20", async (count) => {
    const readMessages = vi.fn(async () =>
      Array.from({ length: count }, (_, index) => ({
        id: String(index + 1),
        content: String(index + 1),
        timestamp: `2026-08-07T12:00:${String(index).padStart(2, "0")}Z`,
        author: { id: "u" },
      })),
    );
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {} as OpenClawConfig,
      readMessages,
    })(request);
    expect(result.messages).toHaveLength(Math.min(count, 20));
  });

  it("keeps a second channel under one account exact", async () => {
    const readMessages = vi.fn(async () => []);
    await createHistoryReadHandler({
      config,
      openclawConfig: {} as OpenClawConfig,
      readMessages,
    })({ ...request, sourceTarget: "v1:discord:acct-a:channel-2" });
    expect(readMessages).toHaveBeenCalledWith(
      "channel-2",
      { limit: 20, before: "pending-1" },
      { cfg: {}, accountId: "acct-a" },
    );
  });

  it("rejects unconfigured identity and closed-schema drift without provider access", async () => {
    const readMessages = vi.fn(async () => []);
    const handler = createHistoryReadHandler({ config, openclawConfig: {}, readMessages });
    await expect(
      handler({ ...request, sourceTarget: "v1:discord:acct-c:channel-1" }),
    ).rejects.toThrow("not a configured Deliberation source");
    await expect(handler({ ...request, extra: true })).rejects.toThrow(
      "does not match schema version 1",
    );
    expect(readMessages).not.toHaveBeenCalled();
  });

  it("captures one watermark and excludes a concurrent post-watermark arrival", async () => {
    const reads: Array<{ limit: number; before?: string; after?: string }> = [];
    let available = [
      {
        id: "105",
        content: "at watermark",
        timestamp: "2026-08-07T12:00:05Z",
        author: { id: "u" },
      },
      {
        id: "101",
        content: "after cutoff",
        timestamp: "2026-08-07T12:00:01Z",
        author: { id: "u" },
      },
    ];
    const readMessages = vi.fn(async (_channel, query) => {
      reads.push(query);
      const page = available
        .filter((message) => !query.after || BigInt(message.id) > BigInt(query.after))
        .filter((message) => !query.before || BigInt(message.id) < BigInt(query.before))
        .slice(0, query.limit);
      if (reads.length === 1) {
        available = [
          {
            id: "106",
            content: "concurrent",
            timestamp: "2026-08-07T12:00:06Z",
            author: { id: "u" },
          },
          ...available,
        ];
      }
      return page;
    });

    const result = await createHistoryReadHandler({ config, openclawConfig: {}, readMessages })({
      schemaVersion: 2,
      sourceTarget: "v1:discord:acct-b:channel-1",
      after: "100",
    });

    expect(result.watermarkProviderEventId).toBe("105");
    expect(result.messages.map((message) => message.providerEventId)).toEqual(["101", "105"]);
    expect(reads[1]).toEqual({ limit: 50, after: "100", before: "106" });
    expect(result.complete).toBe(true);
  });

  it("returns complete empty evidence when the read-start watermark is not newer", async () => {
    const readMessages = vi.fn(async () => []);
    const result = await createHistoryReadHandler({ config, openclawConfig: {}, readMessages })({
      schemaVersion: 2,
      sourceTarget: "v1:discord:acct-b:channel-1",
      after: "100",
    });
    expect(result).toMatchObject({
      schemaVersion: 2,
      cutoffProviderEventId: "100",
      watermarkProviderEventId: "100",
      messages: [],
      complete: true,
    });
    expect(readMessages).toHaveBeenCalledTimes(1);
  });

  it("marks evidence incomplete when one message beyond the artifact count bound exists", async () => {
    const messages = Array.from({ length: 51 }, (_, index) => ({
      id: String(151 - index),
      content: String(index),
      timestamp: `2026-08-07T12:00:${String(index % 60).padStart(2, "0")}Z`,
      author: { id: "u" },
    }));
    const readMessages = vi.fn(async (_channel, query) => {
      if (query.limit === 1) return [messages[0]];
      return messages
        .filter((item) => BigInt(item.id) < BigInt(query.before ?? "999"))
        .slice(0, query.limit);
    });
    const result = await createHistoryReadHandler({ config, openclawConfig: {}, readMessages })({
      schemaVersion: 2,
      sourceTarget: "v1:discord:acct-b:channel-1",
      after: "100",
    });
    expect(result.messages).toHaveLength(50);
    expect(result.complete).toBe(false);
  });

  it("reads only the mapped Slack thread and preserves exact child and root identities", async () => {
    const lookup = vi.fn().mockResolvedValue({
      sourceTarget: "v1:slack:workspace-a:C123",
      providerEventId: "1723640000.000200",
      threadId: "1723640000.000100",
    });
    const readMessage = vi.fn().mockResolvedValue({
      id: "1723640000.000100",
      content: "root",
      senderId: "U1",
      latestReplyId: "1723640000.000300",
    });
    const readThreadPage = vi.fn().mockResolvedValue({
      messages: [
        { id: "1723640000.000100", content: "root", senderId: "U1" },
        {
          id: "1723640000.000200",
          threadId: "1723640000.000100",
          content: "admitted child",
          senderId: "U2",
        },
        {
          id: "1723640000.000300",
          threadId: "1723640000.000100",
          content: "later child",
          senderId: "B1",
          botId: "B1",
        },
      ],
    });
    const resolveChannelHistory = vi.fn().mockReturnValue({ readMessage, readThreadPage });

    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      threadStore: { lookup } as never,
      resolveChannelHistory,
    })({
      schemaVersion: 2,
      sourceTarget: "v1:slack:workspace-a:C123",
      after: "1723640000.000200",
    });

    expect(resolveChannelHistory).toHaveBeenCalledWith({
      provider: "slack",
      accountId: "workspace-a",
    });
    expect(readMessage).toHaveBeenCalledWith({
      channelId: "C123",
      messageId: "1723640000.000100",
    });
    expect(readThreadPage).toHaveBeenCalledWith({
      channelId: "C123",
      threadId: "1723640000.000100",
      oldest: "1723640000.000200",
      latest: "1723640000.000300",
      inclusive: true,
      limit: 50,
    });
    expect(result).toMatchObject({
      schemaVersion: 2,
      sourceTarget: "v1:slack:workspace-a:C123",
      cutoffProviderEventId: "1723640000.000200",
      watermarkProviderEventId: "1723640000.000300",
      provenance: { provider: "slack", account: "workspace-a", channel: "C123" },
      complete: true,
    });
    expect(result.messages).toEqual([
      {
        providerEventId: "1723640000.000300",
        senderId: "B1",
        senderIsBot: true,
        eventType: "message",
        occurredAt: "2024-08-14T12:53:20.000Z",
        content: "later child",
      },
    ]);
  });

  it("orders Slack decimal timestamps exactly instead of lexically or as floats", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      threadStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: "1723640000.01",
          threadId: "1723640000.01",
        }),
      } as never,
      resolveChannelHistory: vi.fn().mockReturnValue({
        readMessage: vi.fn().mockResolvedValue({
          id: "1723640000.01",
          content: "root",
          senderId: "U1",
          latestReplyId: "1723640000.9",
        }),
        readThreadPage: vi.fn().mockResolvedValue({
          messages: [
            { id: "1723640000.9", threadId: "1723640000.01", content: "later", senderId: "U1" },
            { id: "1723640000.10", threadId: "1723640000.01", content: "earlier", senderId: "U1" },
          ],
        }),
      }),
    })({ schemaVersion: 2, sourceTarget, after: "1723640000.01" });

    expect(result.messages.map((message) => message.providerEventId)).toEqual([
      "1723640000.10",
      "1723640000.9",
    ]);
  });

  it.each([
    [
      "conflicting stored source",
      {
        sourceTarget: "v1:slack:workspace-b:C123",
        providerEventId: "1723640000.1",
        threadId: "1723640000.1",
      },
    ],
    [
      "conflicting stored event",
      {
        sourceTarget: "v1:slack:workspace-a:C123",
        providerEventId: "1723640000.2",
        threadId: "1723640000.1",
      },
    ],
    [
      "malformed stored thread",
      {
        sourceTarget: "v1:slack:workspace-a:C123",
        providerEventId: "1723640000.1",
        threadId: "bad",
      },
    ],
    [
      "stored thread later than child",
      {
        sourceTarget: "v1:slack:workspace-a:C123",
        providerEventId: "1723640000.1",
        threadId: "1723640000.2",
      },
    ],
  ])("fails closed for Slack history with %s", async (_name, mapping) => {
    const resolveChannelHistory = vi.fn();
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {},
      threadStore: { lookup: vi.fn().mockResolvedValue(mapping) } as never,
      resolveChannelHistory,
    });

    await expect(
      handler({
        schemaVersion: 2,
        sourceTarget: "v1:slack:workspace-a:C123",
        after: "1723640000.1",
      }),
    ).rejects.toThrow();
    expect(resolveChannelHistory).not.toHaveBeenCalled();
  });

  it("rejects malformed and off-thread Slack provider rows", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const makeHandler = (message: Record<string, unknown>) =>
      createHistoryReadHandler({
        config,
        openclawConfig: {},
        threadStore: {
          lookup: vi.fn().mockResolvedValue({
            sourceTarget,
            providerEventId: "1723640000.1",
            threadId: "1723640000.1",
          }),
        } as never,
        resolveChannelHistory: vi.fn().mockReturnValue({
          readMessage: vi.fn().mockResolvedValue({
            id: "1723640000.1",
            content: "root",
            senderId: "U1",
            latestReplyId: "1723640000.3",
          }),
          readThreadPage: vi.fn().mockResolvedValue({ messages: [message] }),
        }),
      });
    const request = { schemaVersion: 2, sourceTarget, after: "1723640000.1" };

    await expect(
      makeHandler({ id: "1723640000.bad", content: "bad", senderId: "U1" })(request),
    ).rejects.toThrow();
    await expect(
      makeHandler({
        id: "1723640000.2",
        threadId: "1723649999.1",
        content: "wrong thread",
        senderId: "U1",
      })(request),
    ).rejects.toThrow();
    await expect(
      makeHandler({ id: "1723640000.2", content: "missing thread", senderId: "U1" })(request),
    ).rejects.toThrow();
    await expect(
      makeHandler({
        id: "1723640000.2",
        threadId: "1723640000.1",
        content: "invalid sender",
        senderId: 123,
      })(request),
    ).rejects.toThrow("invalid sender");
  });

  it("rejects repeated Slack pagination cursors", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {},
      threadStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: "1723640000.1",
          threadId: "1723640000.1",
        }),
      } as never,
      resolveChannelHistory: vi.fn().mockReturnValue({
        readMessage: vi.fn().mockResolvedValue({
          id: "1723640000.1",
          content: "root",
          senderId: "U1",
          latestReplyId: "1723640000.3",
        }),
        readThreadPage: vi
          .fn()
          .mockResolvedValueOnce({ messages: [], nextCursor: "same" })
          .mockResolvedValueOnce({ messages: [], nextCursor: "same" }),
      }),
    });

    await expect(
      handler({ schemaVersion: 2, sourceTarget, after: "1723640000.1" }),
    ).rejects.toThrow("pagination did not advance");
  });

  it("stops a distinct-cursor Slack chain at the page budget and marks evidence incomplete", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const readThreadPage = vi.fn(async ({ cursor }: { cursor?: string }) => ({
      messages: [],
      nextCursor: `cursor-${Number(cursor?.split("-")[1] ?? 0) + 1}`,
    }));
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      threadStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: "1723640000.000001",
          threadId: "1723640000.000001",
        }),
      } as never,
      resolveChannelHistory: vi.fn().mockReturnValue({
        readMessage: vi.fn().mockResolvedValue({
          id: "1723640000.000001",
          content: "root",
          senderId: "U1",
          latestReplyId: "1723640000.000002",
        }),
        readThreadPage,
      }),
    })({ schemaVersion: 2, sourceTarget, after: "1723640000.000001" });

    expect(readThreadPage).toHaveBeenCalledTimes(4);
    expect(result.messages).toEqual([]);
    expect(result.complete).toBe(false);
  });

  it("caps Slack freshness evidence at 50 messages and marks it incomplete", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const replies = Array.from({ length: 51 }, (_, index) => ({
      id: `1723640000.${String(index + 2).padStart(6, "0")}`,
      threadId: "1723640000.000001",
      content: `reply-${index + 1}`,
      senderId: "U1",
    }));
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      threadStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: "1723640000.000001",
          threadId: "1723640000.000001",
        }),
      } as never,
      resolveChannelHistory: vi.fn().mockReturnValue({
        readMessage: vi.fn().mockResolvedValue({
          id: "1723640000.000001",
          content: "root",
          senderId: "U1",
          latestReplyId: "1723640000.000052",
        }),
        readThreadPage: vi.fn().mockResolvedValue({ messages: replies }),
      }),
    })({ schemaVersion: 2, sourceTarget, after: "1723640000.000001" });

    expect(result.messages).toHaveLength(50);
    expect(result.messages[0]?.providerEventId).toBe("1723640000.000003");
    expect(result.complete).toBe(false);
  });

  it("enforces the Slack freshness byte bound in the returned wire object", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      threadStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: "1723640000.000001",
          threadId: "1723640000.000001",
        }),
      } as never,
      resolveChannelHistory: vi.fn().mockReturnValue({
        readMessage: vi.fn().mockResolvedValue({
          id: "1723640000.000001",
          content: "root",
          senderId: "U1",
          latestReplyId: "1723640000.000002",
        }),
        readThreadPage: vi.fn().mockResolvedValue({
          messages: [
            {
              id: "1723640000.000002",
              threadId: "1723640000.000001",
              content: "x".repeat(40 * 1024),
              senderId: "U1",
            },
          ],
        }),
      }),
    })({ schemaVersion: 2, sourceTarget, after: "1723640000.000001" });

    expect(Buffer.byteLength(JSON.stringify(result.messages), "utf8")).toBeLessThanOrEqual(
      32 * 1024,
    );
    expect(result.complete).toBe(false);
  });

  it("rejects conflicting duplicate Slack message ids", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {},
      threadStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: "1723640000.000001",
          threadId: "1723640000.000001",
        }),
      } as never,
      resolveChannelHistory: vi.fn().mockReturnValue({
        readMessage: vi.fn().mockResolvedValue({
          id: "1723640000.000001",
          content: "root",
          senderId: "U1",
          latestReplyId: "1723640000.000002",
        }),
        readThreadPage: vi.fn().mockResolvedValue({
          messages: [
            {
              id: "1723640000.000002",
              threadId: "1723640000.000001",
              content: "first",
              senderId: "U1",
            },
            {
              id: "1723640000.000002",
              threadId: "1723640000.000001",
              content: "conflict",
              senderId: "U1",
            },
          ],
        }),
      }),
    });

    await expect(
      handler({ schemaVersion: 2, sourceTarget, after: "1723640000.000001" }),
    ).rejects.toThrow("conflicting message id");
  });
});
