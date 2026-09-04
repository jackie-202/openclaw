import type { OpenClawConfig } from "openclaw/plugin-sdk/discord";
import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createHistoryReadHandler } from "./history-read.js";
import type {
  DiscordHistoryIdentity,
  SourceHistoryIdentityStore,
} from "./thread-identity-store.js";

const config = parseDeliberationConfig({
  enabled: true,
  failClosed: true,
  pipelines: [
    {
      id: "discord-acct-a-channel-1",
      source: { channel: "discord", accountId: "acct-a", target: "channel-1" },
    },
    {
      id: "discord-acct-b-channel-1",
      source: { channel: "discord", accountId: "acct-b", target: "channel-1" },
    },
    {
      id: "discord-acct-a-channel-2",
      source: { channel: "discord", accountId: "acct-a", target: "channel-2" },
    },
    {
      id: "slack-workspace-a-c123",
      source: { channel: "slack", accountId: "workspace-a", target: "C123" },
    },
    {
      id: "slack-workspace-b-c123",
      source: { channel: "slack", accountId: "workspace-b", target: "C123" },
    },
    {
      id: "slack-workspace-a-c456",
      source: { channel: "slack", accountId: "workspace-a", target: "C456" },
    },
    {
      id: "slack-default-configured-channel",
      source: { channel: "slack", accountId: "default", target: "C0BJW0FALSC" },
    },
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

function discordHistoryStore(historyChannelId?: string): SourceHistoryIdentityStore {
  return {
    lookup: vi.fn(async (key: string): Promise<DiscordHistoryIdentity | undefined> => {
      const [sourceTarget, providerEventId] = key.split("\u0000");
      if (!sourceTarget || !providerEventId) {
        return undefined;
      }
      const resolvedHistoryChannelId = historyChannelId ?? sourceTarget.split(":").at(-1);
      if (!resolvedHistoryChannelId) {
        return undefined;
      }
      return {
        provider: "discord",
        sourceTarget,
        providerEventId,
        historyChannelId: resolvedHistoryChannelId,
      };
    }),
    registerIfAbsent: vi.fn(async () => true),
  };
}

describe("Deliberation history read", () => {
  it("reads the exact account and channel and normalizes chronological history", async () => {
    const readMessages = vi.fn(async () => [
      {
        id: "2",
        channel_id: "channel-1",
        content: "later",
        timestamp: "2026-08-07T12:00:02Z",
        author: { id: "u" },
      },
      {
        id: "1",
        channel_id: "channel-1",
        content: "bot",
        timestamp: "2026-08-07T12:00:01Z",
        author: { id: "b", bot: true },
      },
    ]);
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {} as OpenClawConfig,
      readMessages,
      historyStore: discordHistoryStore(),
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
        channel_id: "channel-1",
        content: String(index + 1),
        timestamp: `2026-08-07T12:00:${String(index).padStart(2, "0")}Z`,
        author: { id: "u" },
      })),
    );
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {} as OpenClawConfig,
      readMessages,
      historyStore: discordHistoryStore(),
    })(request);
    expect(result.messages).toHaveLength(Math.min(count, 20));
  });

  it("keeps a second channel under one account exact", async () => {
    const readMessages = vi.fn(async () => []);
    await createHistoryReadHandler({
      config,
      openclawConfig: {} as OpenClawConfig,
      readMessages,
      historyStore: discordHistoryStore(),
    })({ ...request, sourceTarget: "v1:discord:acct-a:channel-2" });
    expect(readMessages).toHaveBeenCalledWith(
      "channel-2",
      { limit: 20, before: "pending-1" },
      { cfg: {}, accountId: "acct-a" },
    );
  });

  it("rejects unconfigured identity and closed-schema drift without provider access", async () => {
    const readMessages = vi.fn(async () => []);
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {},
      readMessages,
      historyStore: discordHistoryStore(),
    });
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
        channel_id: "channel-1",
        content: "at watermark",
        timestamp: "2026-08-07T12:00:05Z",
        author: { id: "u" },
      },
      {
        id: "101",
        channel_id: "channel-1",
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
            channel_id: "channel-1",
            content: "concurrent",
            timestamp: "2026-08-07T12:00:06Z",
            author: { id: "u" },
          },
          ...available,
        ];
      }
      return page;
    });

    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      readMessages,
      historyStore: discordHistoryStore(),
    })({
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
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      readMessages,
      historyStore: discordHistoryStore(),
    })({
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
      channel_id: "channel-1",
      content: String(index),
      timestamp: `2026-08-07T12:00:${String(index % 60).padStart(2, "0")}Z`,
      author: { id: "u" },
    }));
    const readMessages = vi.fn(async (_channel, query) => {
      if (query.limit === 1) {
        return [messages[0]];
      }
      return messages
        .filter((item) => BigInt(item.id) < BigInt(query.before ?? "999"))
        .slice(0, query.limit);
    });
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      readMessages,
      historyStore: discordHistoryStore(),
    })({
      schemaVersion: 2,
      sourceTarget: "v1:discord:acct-b:channel-1",
      after: "100",
    });
    expect(result.messages).toHaveLength(50);
    expect(result.complete).toBe(false);
  });

  it("reads a Discord child thread exactly while retaining the parent source route", async () => {
    const readMessages = vi.fn(async () => []);
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      readMessages,
      historyStore: discordHistoryStore("thread-1"),
    })({
      schemaVersion: 1,
      sourceTarget: "v1:discord:acct-a:channel-1",
      before: "child-message-1",
      limit: 20,
    });

    expect(readMessages).toHaveBeenCalledWith(
      "thread-1",
      { limit: 20, before: "child-message-1" },
      { cfg: {}, accountId: "acct-a" },
    );
    expect(result).toMatchObject({
      sourceTarget: "v1:discord:acct-a:channel-1",
      provenance: { provider: "discord", account: "acct-a", channel: "channel-1" },
    });
  });

  it.each([
    ["missing", undefined],
    [
      "conflicting source",
      {
        provider: "discord",
        sourceTarget: "v1:discord:acct-a:channel-2",
        providerEventId: "child-message-1",
        historyChannelId: "thread-1",
      },
    ],
    [
      "conflicting event",
      {
        provider: "discord",
        sourceTarget: "v1:discord:acct-a:channel-1",
        providerEventId: "other-message",
        historyChannelId: "thread-1",
      },
    ],
    [
      "off-thread provider",
      {
        provider: "slack",
        sourceTarget: "v1:discord:acct-a:channel-1",
        providerEventId: "child-message-1",
        historyChannelId: "thread-1",
      },
    ],
    [
      "missing history channel",
      {
        provider: "discord",
        sourceTarget: "v1:discord:acct-a:channel-1",
        providerEventId: "child-message-1",
      },
    ],
  ])("fails closed for Discord history with %s identity", async (_name, mapping) => {
    const readMessages = vi.fn(async () => []);
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {},
      readMessages,
      historyStore: { lookup: vi.fn().mockResolvedValue(mapping) } as never,
    });

    await expect(
      handler({
        schemaVersion: 1,
        sourceTarget: "v1:discord:acct-a:channel-1",
        before: "child-message-1",
        limit: 20,
      }),
    ).rejects.toThrow("Discord history identity mapping is unavailable or conflicting");
    expect(readMessages).not.toHaveBeenCalled();
  });

  it("rejects Discord provider rows outside the authenticated history channel", async () => {
    const readMessages = vi.fn(async () => [
      {
        id: "1",
        channel_id: "sibling-thread",
        content: "wrong thread",
        timestamp: "2026-08-07T12:00:01Z",
        author: { id: "u" },
      },
    ]);
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {},
      readMessages,
      historyStore: discordHistoryStore("thread-1"),
    });

    await expect(
      handler({
        schemaVersion: 1,
        sourceTarget: "v1:discord:acct-a:channel-1",
        before: "child-message-1",
        limit: 20,
      }),
    ).rejects.toThrow("off-channel message");
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
    const readChannelPage = vi.fn();
    const resolveChannelHistory = vi
      .fn()
      .mockReturnValue({ readMessage, readChannelPage, readThreadPage });

    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      historyStore: { lookup } as never,
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
    expect(readChannelPage).not.toHaveBeenCalled();
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

  it("merges newer channel roots and same-thread replies for a root cutoff", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const cutoff = "1723640000.000100";
    const replyId = "1723640000.000200";
    const newerRootId = "1723640000.000300";
    const readChannelPage = vi
      .fn()
      .mockResolvedValueOnce({
        messages: [
          {
            id: newerRootId,
            threadId: newerRootId,
            content: "new root",
            senderId: "U3",
          },
        ],
      })
      .mockResolvedValueOnce({
        messages: [
          {
            id: newerRootId,
            threadId: newerRootId,
            content: "new root",
            senderId: "U3",
          },
          { id: cutoff, content: "cutoff root", senderId: "U1" },
        ],
      });
    const readThreadPage = vi.fn().mockResolvedValue({
      messages: [
        { id: cutoff, content: "cutoff root", senderId: "U1" },
        { id: replyId, threadId: cutoff, content: "reply", senderId: "U2" },
      ],
    });

    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      historyStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: cutoff,
          threadId: cutoff,
        }),
      } as never,
      resolveChannelHistory: vi.fn().mockReturnValue({
        readMessage: vi.fn().mockResolvedValue({
          id: cutoff,
          content: "cutoff root",
          senderId: "U1",
          latestReplyId: replyId,
        }),
        readChannelPage,
        readThreadPage,
      }),
    })({ schemaVersion: 2, sourceTarget, after: cutoff });

    expect(readChannelPage).toHaveBeenNthCalledWith(1, {
      channelId: "C123",
      oldest: cutoff,
      inclusive: false,
      limit: 1,
    });
    expect(readChannelPage).toHaveBeenNthCalledWith(2, {
      channelId: "C123",
      oldest: cutoff,
      latest: newerRootId,
      inclusive: true,
      limit: 50,
    });
    expect(readThreadPage).toHaveBeenCalledWith({
      channelId: "C123",
      threadId: cutoff,
      oldest: cutoff,
      latest: newerRootId,
      inclusive: true,
      limit: 50,
    });
    expect(result.watermarkProviderEventId).toBe(newerRootId);
    expect(result.messages.map((message) => message.providerEventId)).toEqual([
      replyId,
      newerRootId,
    ]);
    expect(result.complete).toBe(true);
  });

  it("rejects threaded rows returned by root-cutoff channel history", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const cutoff = "1723640000.000100";
    const newerRootId = "1723640000.000200";
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {},
      historyStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: cutoff,
          threadId: cutoff,
        }),
      } as never,
      resolveChannelHistory: vi.fn().mockReturnValue({
        readMessage: vi.fn().mockResolvedValue({
          id: cutoff,
          content: "cutoff root",
          senderId: "U1",
        }),
        readChannelPage: vi.fn().mockResolvedValue({
          messages: [
            {
              id: newerRootId,
              threadId: "1723640000.000050",
              content: "unrelated reply",
              senderId: "U9",
            },
          ],
        }),
        readThreadPage: vi.fn().mockResolvedValue({ messages: [] }),
      }),
    });

    await expect(handler({ schemaVersion: 2, sourceTarget, after: cutoff })).rejects.toThrow(
      "invalid or threaded channel message",
    );
  });

  it("resolves the configured default Slack account and exact channel root", async () => {
    const sourceTarget = "v1:slack:default:C0BJW0FALSC";
    const readMessage = vi.fn().mockResolvedValue({
      id: "1787683185.523829",
      content: "root",
      senderId: "U1",
    });
    const readThreadPage = vi.fn();
    const readChannelPage = vi.fn().mockResolvedValue({ messages: [] });
    const resolveChannelHistory = vi
      .fn()
      .mockReturnValue({ readMessage, readChannelPage, readThreadPage });

    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      historyStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: "1787683185.523829",
          threadId: "1787683185.523829",
        }),
      } as never,
      resolveChannelHistory,
    })({ schemaVersion: 2, sourceTarget, after: "1787683185.523829" });

    expect(resolveChannelHistory).toHaveBeenCalledWith({ provider: "slack", accountId: "default" });
    expect(readMessage).toHaveBeenCalledWith({
      channelId: "C0BJW0FALSC",
      messageId: "1787683185.523829",
    });
    expect(readChannelPage).toHaveBeenCalledWith({
      channelId: "C0BJW0FALSC",
      oldest: "1787683185.523829",
      inclusive: false,
      limit: 1,
    });
    expect(readThreadPage).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      sourceTarget,
      provenance: { provider: "slack", account: "default", channel: "C0BJW0FALSC" },
      watermarkProviderEventId: "1787683185.523829",
      complete: true,
    });
  });

  it("orders Slack decimal timestamps exactly instead of lexically or as floats", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const result = await createHistoryReadHandler({
      config,
      openclawConfig: {},
      historyStore: {
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
        readChannelPage: vi.fn().mockResolvedValue({ messages: [] }),
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
      historyStore: { lookup: vi.fn().mockResolvedValue(mapping) } as never,
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
        historyStore: {
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
          readChannelPage: vi.fn().mockResolvedValue({ messages: [] }),
          readThreadPage: vi.fn().mockResolvedValue({ messages: [message] }),
        }),
      });
    const slackRequest = { schemaVersion: 2, sourceTarget, after: "1723640000.1" };

    await expect(
      makeHandler({ id: "1723640000.bad", content: "bad", senderId: "U1" })(slackRequest),
    ).rejects.toThrow();
    await expect(
      makeHandler({
        id: "1723640000.2",
        threadId: "1723649999.1",
        content: "wrong thread",
        senderId: "U1",
      })(slackRequest),
    ).rejects.toThrow();
    await expect(
      makeHandler({ id: "1723640000.2", content: "missing thread", senderId: "U1" })(slackRequest),
    ).rejects.toThrow();
    await expect(
      makeHandler({
        id: "1723640000.2",
        threadId: "1723640000.1",
        content: "invalid sender",
        senderId: 123,
      })(slackRequest),
    ).rejects.toThrow("invalid sender");
  });

  it("rejects repeated Slack pagination cursors", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {},
      historyStore: {
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
        readChannelPage: vi.fn().mockResolvedValue({ messages: [] }),
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

  it("rejects repeated Slack channel pagination cursors", async () => {
    const sourceTarget = "v1:slack:workspace-a:C123";
    const cutoff = "1723640000.000100";
    const newerRoot = { id: "1723640000.000200", content: "new root", senderId: "U2" };
    const handler = createHistoryReadHandler({
      config,
      openclawConfig: {},
      historyStore: {
        lookup: vi.fn().mockResolvedValue({
          sourceTarget,
          providerEventId: cutoff,
          threadId: cutoff,
        }),
      } as never,
      resolveChannelHistory: vi.fn().mockReturnValue({
        readMessage: vi.fn().mockResolvedValue({
          id: cutoff,
          content: "root",
          senderId: "U1",
        }),
        readChannelPage: vi
          .fn()
          .mockResolvedValueOnce({ messages: [newerRoot] })
          .mockResolvedValueOnce({ messages: [newerRoot], nextCursor: "same" })
          .mockResolvedValueOnce({ messages: [], nextCursor: "same" }),
        readThreadPage: vi.fn(),
      }),
    });

    await expect(handler({ schemaVersion: 2, sourceTarget, after: cutoff })).rejects.toThrow(
      "pagination did not advance",
    );
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
      historyStore: {
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
        readChannelPage: vi.fn().mockResolvedValue({ messages: [] }),
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
      historyStore: {
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
        readChannelPage: vi.fn().mockResolvedValue({ messages: [] }),
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
      historyStore: {
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
        readChannelPage: vi.fn().mockResolvedValue({ messages: [] }),
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
      historyStore: {
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
        readChannelPage: vi.fn().mockResolvedValue({ messages: [] }),
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
