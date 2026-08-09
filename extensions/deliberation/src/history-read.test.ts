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
});
