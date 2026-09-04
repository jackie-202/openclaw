import type { WebClient } from "@slack/web-api";
import type {
  ChannelHistoryMessage,
  ChannelHistoryRuntimeContext,
} from "openclaw/plugin-sdk/channel-runtime-context";

type SlackHistoryMessage = {
  ts?: string;
  thread_ts?: string;
  text?: string;
  user?: string;
  bot_id?: string;
  latest_reply?: string;
};

function normalizeMessage(message: SlackHistoryMessage): ChannelHistoryMessage {
  return {
    id: message.ts,
    threadId: message.thread_ts,
    content: message.text,
    senderId: message.user,
    botId: message.bot_id,
    latestReplyId: message.latest_reply,
  };
}

export function createSlackChannelHistoryContext(params: {
  client: WebClient;
  token: string;
}): ChannelHistoryRuntimeContext {
  return {
    async readChannelPage({ channelId, cursor, limit, oldest, latest, inclusive }) {
      const result = await params.client.conversations.history({
        token: params.token,
        channel: channelId,
        ...(cursor ? { cursor } : {}),
        ...(oldest ? { oldest } : {}),
        ...(latest ? { latest } : {}),
        ...(inclusive === undefined ? {} : { inclusive }),
        limit,
      });
      const nextCursor = result.response_metadata?.next_cursor?.trim();
      return {
        messages: ((result.messages ?? []) as SlackHistoryMessage[]).map(normalizeMessage),
        ...(nextCursor ? { nextCursor } : {}),
      };
    },
    async readMessage({ channelId, messageId }) {
      const result = await params.client.conversations.history({
        token: params.token,
        channel: channelId,
        oldest: messageId,
        latest: messageId,
        inclusive: true,
        limit: 1,
      });
      const message = result.messages?.[0] as SlackHistoryMessage | undefined;
      return message?.ts === messageId ? normalizeMessage(message) : undefined;
    },
    async readThreadPage({ channelId, threadId, cursor, limit, oldest, latest, inclusive }) {
      const result = await params.client.conversations.replies({
        token: params.token,
        channel: channelId,
        ts: threadId,
        ...(cursor ? { cursor } : {}),
        ...(oldest ? { oldest } : {}),
        ...(latest ? { latest } : {}),
        ...(inclusive === undefined ? {} : { inclusive }),
        limit,
      });
      const nextCursor = result.response_metadata?.next_cursor?.trim();
      return {
        messages: ((result.messages ?? []) as SlackHistoryMessage[]).map(normalizeMessage),
        ...(nextCursor ? { nextCursor } : {}),
      };
    },
  };
}
