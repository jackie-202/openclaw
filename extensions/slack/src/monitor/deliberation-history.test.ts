import type { WebClient } from "@slack/web-api";
import { describe, expect, it, vi } from "vitest";
import { createSlackChannelHistoryContext } from "./deliberation-history.js";

describe("Slack channel history runtime context", () => {
  it("reads one bounded channel page through conversations.history", async () => {
    const history = vi.fn().mockResolvedValue({
      messages: [{ ts: "1723640000.000200", text: "new root", user: "U2" }],
      response_metadata: { next_cursor: " next " },
    });
    const context = createSlackChannelHistoryContext({
      client: { conversations: { history } } as unknown as WebClient,
      token: "test-token",
    });
    await expect(
      context.readChannelPage?.({
        channelId: "C123",
        cursor: "cursor-1",
        oldest: "1723640000.000100",
        latest: "1723640000.000300",
        inclusive: true,
        limit: 50,
      }),
    ).resolves.toEqual({
      messages: [
        {
          id: "1723640000.000200",
          threadId: undefined,
          content: "new root",
          senderId: "U2",
          botId: undefined,
          latestReplyId: undefined,
        },
      ],
      nextCursor: "next",
    });
    expect(history).toHaveBeenCalledWith({
      token: "test-token",
      channel: "C123",
      cursor: "cursor-1",
      oldest: "1723640000.000100",
      latest: "1723640000.000300",
      inclusive: true,
      limit: 50,
    });
  });

  it("reads one exact root through conversations.history", async () => {
    const history = vi.fn().mockResolvedValue({
      messages: [
        {
          ts: "1723640000.000100",
          text: "root",
          user: "U1",
          latest_reply: "1723640000.000300",
        },
      ],
    });
    const context = createSlackChannelHistoryContext({
      client: { conversations: { history } } as unknown as WebClient,
      token: "test-token",
    });

    await expect(
      context.readMessage({ channelId: "C123", messageId: "1723640000.000100" }),
    ).resolves.toEqual({
      id: "1723640000.000100",
      content: "root",
      senderId: "U1",
      botId: undefined,
      latestReplyId: "1723640000.000300",
    });
    expect(history).toHaveBeenCalledWith({
      token: "test-token",
      channel: "C123",
      oldest: "1723640000.000100",
      latest: "1723640000.000100",
      inclusive: true,
      limit: 1,
    });
  });

  it("returns one cursor page from exactly one conversations.replies thread", async () => {
    const replies = vi.fn().mockResolvedValue({
      messages: [
        {
          ts: "1723640000.000200",
          thread_ts: "1723640000.000100",
          text: "reply",
          bot_id: "B1",
        },
      ],
      response_metadata: { next_cursor: " cursor-2 " },
    });
    const context = createSlackChannelHistoryContext({
      client: { conversations: { replies } } as unknown as WebClient,
      token: "test-token",
    });

    await expect(
      context.readThreadPage({
        channelId: "C123",
        threadId: "1723640000.000100",
        cursor: "cursor-1",
        limit: 50,
        oldest: "1723640000.000200",
        latest: "1723640000.000300",
        inclusive: true,
      }),
    ).resolves.toEqual({
      messages: [
        {
          id: "1723640000.000200",
          threadId: "1723640000.000100",
          content: "reply",
          senderId: undefined,
          botId: "B1",
          latestReplyId: undefined,
        },
      ],
      nextCursor: "cursor-2",
    });
    expect(replies).toHaveBeenCalledWith({
      token: "test-token",
      channel: "C123",
      ts: "1723640000.000100",
      cursor: "cursor-1",
      oldest: "1723640000.000200",
      latest: "1723640000.000300",
      inclusive: true,
      limit: 50,
    });
  });
});
