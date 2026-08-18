/**
 * Runtime SDK subpath for registering and watching channel runtime contexts.
 */
export {
  getChannelRuntimeContext,
  registerChannelRuntimeContext,
  watchChannelRuntimeContexts,
} from "../infra/channel-runtime-context.js";
export type { ChannelRuntimeContextKey } from "../channels/plugins/channel-runtime-surface.types.js";

export const CHANNEL_HISTORY_RUNTIME_CONTEXT_CAPABILITY = "channel.history.v1";

export type ChannelHistoryMessage = {
  id?: string;
  threadId?: string;
  content?: string;
  senderId?: string;
  botId?: string;
  latestReplyId?: string;
};

export type ChannelHistoryRuntimeContext = {
  readMessage(params: {
    channelId: string;
    messageId: string;
  }): Promise<ChannelHistoryMessage | undefined>;
  readThreadPage(params: {
    channelId: string;
    threadId: string;
    cursor?: string;
    limit: number;
    oldest?: string;
    latest?: string;
    inclusive?: boolean;
  }): Promise<{ messages: ChannelHistoryMessage[]; nextCursor?: string }>;
};
