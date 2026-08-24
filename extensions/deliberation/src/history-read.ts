import type { ChannelRuntimeSurface } from "openclaw/plugin-sdk/channel-contract";
import {
  CHANNEL_HISTORY_RUNTIME_CONTEXT_CAPABILITY,
  getChannelRuntimeContext,
  type ChannelHistoryMessage,
  type ChannelHistoryRuntimeContext,
} from "openclaw/plugin-sdk/channel-runtime-context";
import {
  readMessagesDiscord,
  type DiscordHistoryMessage,
  type OpenClawConfig,
} from "openclaw/plugin-sdk/discord";
import { routeKey, type DeliberationConfig } from "./config.js";
import { compareSlackTimestamps, isSlackTimestamp, slackTimestampIso } from "./slack-timestamp.js";
import { parseSourceIdentity } from "./source-identity.js";
import {
  sourceHistoryIdentityKey,
  type SourceHistoryIdentityStore,
} from "./thread-identity-store.js";

export const HISTORY_READ_METHOD = "deliberation.history.read";
export const HISTORY_READ_LIMIT = 20;
const FRESHNESS_PAGE_LIMIT = 50;
const SLACK_HISTORY_MAX_PAGES = 4;
const FRESHNESS_MESSAGE_LIMIT = 50;
const FRESHNESS_BYTE_LIMIT = 32 * 1024;

type NormalizedMessage = {
  providerEventId: string;
  senderId: string;
  senderIsBot: boolean;
  eventType: "message";
  occurredAt: string;
  content: string;
};

type DiscordHistoryRow = DiscordHistoryMessage & { channel_id?: unknown };

type HistoryReader = (
  channelId: string,
  query: { limit: number; before?: string; after?: string },
  opts: { cfg: OpenClawConfig; accountId: string },
) => Promise<DiscordHistoryRow[]>;

type ChannelHistoryResolver = (params: {
  provider: "slack";
  accountId: string;
}) => ChannelHistoryRuntimeContext | undefined;

function readClosedRequest(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("history request must be an object");
  }
  const request = value as Record<string, unknown>;
  if (request.schemaVersion === 2) {
    if (
      Object.keys(request).toSorted().join(",") !== "after,schemaVersion,sourceTarget" ||
      typeof request.sourceTarget !== "string" ||
      typeof request.after !== "string" ||
      !request.after
    ) {
      throw new Error("history request does not match schema version 2");
    }
    return { schemaVersion: 2 as const, sourceTarget: request.sourceTarget, after: request.after };
  }
  if (
    Object.keys(request).toSorted().join(",") !== "before,limit,schemaVersion,sourceTarget" ||
    request.schemaVersion !== 1 ||
    request.limit !== HISTORY_READ_LIMIT ||
    typeof request.sourceTarget !== "string" ||
    typeof request.before !== "string" ||
    !request.before
  ) {
    throw new Error("history request does not match schema version 1");
  }
  return { schemaVersion: 1 as const, sourceTarget: request.sourceTarget, before: request.before };
}

function snowflake(value: string): bigint {
  if (!/^\d+$/.test(value)) {
    throw new Error("Discord history response contains an invalid snowflake");
  }
  return BigInt(value);
}

function normalizeDiscordMessage(
  message: DiscordHistoryRow,
  historyChannelId: string,
): NormalizedMessage {
  if (message.channel_id !== historyChannelId) {
    throw new Error("Discord history response contains an off-channel message");
  }
  if (
    typeof message.id !== "string" ||
    !message.id ||
    typeof message.content !== "string" ||
    typeof message.timestamp !== "string" ||
    typeof message.author?.id !== "string" ||
    !message.author.id
  ) {
    throw new Error("Discord history response contains an invalid message");
  }
  const occurredAt = new Date(message.timestamp);
  if (!Number.isFinite(occurredAt.getTime())) {
    throw new Error("Discord history response contains an invalid timestamp");
  }
  return {
    providerEventId: message.id,
    senderId: message.author.id,
    senderIsBot: message.author.bot === true,
    eventType: "message",
    occurredAt: occurredAt.toISOString(),
    content: message.content,
  };
}

function normalizeSlackMessage(
  message: ChannelHistoryMessage,
  threadId: string,
): NormalizedMessage {
  if (
    typeof message.id !== "string" ||
    typeof message.content !== "string" ||
    (message.threadId === undefined ? message.id !== threadId : message.threadId !== threadId)
  ) {
    throw new Error("Slack history response contains an invalid or off-thread message");
  }
  if (
    (message.senderId !== undefined &&
      (typeof message.senderId !== "string" || !message.senderId)) ||
    (message.botId !== undefined && (typeof message.botId !== "string" || !message.botId))
  ) {
    throw new Error("Slack history response contains an invalid sender");
  }
  const senderId = message.senderId ?? message.botId;
  if (!senderId) {
    throw new Error("Slack history response contains an invalid sender");
  }
  return {
    providerEventId: message.id,
    senderId,
    senderIsBot: Boolean(message.botId),
    eventType: "message",
    occurredAt: slackTimestampIso(message.id),
    content: message.content,
  };
}

function sameMessage(left: NormalizedMessage, right: NormalizedMessage): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function boundFreshnessMessages(messages: NormalizedMessage[]): {
  messages: NormalizedMessage[];
  complete: boolean;
} {
  let complete = messages.length <= FRESHNESS_MESSAGE_LIMIT;
  const bounded = messages.slice(-FRESHNESS_MESSAGE_LIMIT);
  while (Buffer.byteLength(JSON.stringify(bounded), "utf8") > FRESHNESS_BYTE_LIMIT) {
    complete = false;
    bounded.shift();
  }
  return { messages: bounded, complete };
}

function provenance(identity: { provider: string; account: string; channel: string }) {
  return {
    provider: identity.provider,
    account: identity.account,
    channel: identity.channel,
  };
}

function configuredSource(
  config: DeliberationConfig,
  identity: { provider: string; account: string; channel: string },
): boolean {
  if (identity.provider !== "discord" && identity.provider !== "slack") {
    return false;
  }
  return config.pipelineBySourceKey.has(
    routeKey({ channel: identity.provider, accountId: identity.account, target: identity.channel }),
  );
}

async function resolveSlackThread(params: {
  store?: SourceHistoryIdentityStore;
  sourceTarget: string;
  providerEventId: string;
}): Promise<string> {
  if (!isSlackTimestamp(params.providerEventId)) {
    throw new Error("Slack history request contains an invalid timestamp");
  }
  if (!params.store) {
    throw new Error("Slack thread identity store is unavailable");
  }
  const mapping = await params.store.lookup(
    sourceHistoryIdentityKey(params.sourceTarget, params.providerEventId),
  );
  if (
    !mapping ||
    !("threadId" in mapping) ||
    mapping.sourceTarget !== params.sourceTarget ||
    mapping.providerEventId !== params.providerEventId
  ) {
    throw new Error("Slack thread identity mapping is unavailable or conflicting");
  }
  if (!isSlackTimestamp(mapping.threadId)) {
    throw new Error("Slack thread identity mapping contains an invalid timestamp");
  }
  if (compareSlackTimestamps(mapping.threadId, mapping.providerEventId) > 0) {
    throw new Error("Slack thread identity mapping conflicts with message ordering");
  }
  return mapping.threadId;
}

async function resolveDiscordHistoryChannel(params: {
  store?: SourceHistoryIdentityStore;
  sourceTarget: string;
  providerEventId: string;
  accountId: string;
}): Promise<string> {
  if (!params.store) {
    throw new Error("Discord history identity store is unavailable");
  }
  const mapping = await params.store.lookup(
    sourceHistoryIdentityKey(params.sourceTarget, params.providerEventId),
  );
  if (
    !mapping ||
    !("provider" in mapping) ||
    mapping.provider !== "discord" ||
    mapping.sourceTarget !== params.sourceTarget ||
    mapping.providerEventId !== params.providerEventId ||
    typeof mapping.historyChannelId !== "string" ||
    !mapping.historyChannelId ||
    !parseSourceIdentity(`v1:discord:${params.accountId}:${mapping.historyChannelId}`)
  ) {
    throw new Error("Discord history identity mapping is unavailable or conflicting");
  }
  return mapping.historyChannelId;
}

function requireSlackHistoryContext(context: ChannelHistoryRuntimeContext | undefined) {
  if (
    !context ||
    typeof context.readMessage !== "function" ||
    typeof context.readThreadPage !== "function"
  ) {
    throw new Error("Slack account history runtime is unavailable");
  }
  return context;
}

async function readSlackThread(params: {
  reader: ChannelHistoryRuntimeContext;
  channelId: string;
  threadId: string;
  oldest?: string;
  latest?: string;
  inclusive?: boolean;
  onMessage: (message: ChannelHistoryMessage) => boolean | void;
}): Promise<boolean> {
  const cursors = new Set<string>();
  let cursor: string | undefined;
  for (let pageIndex = 0; pageIndex < SLACK_HISTORY_MAX_PAGES; pageIndex += 1) {
    const page = await params.reader.readThreadPage({
      channelId: params.channelId,
      threadId: params.threadId,
      ...(cursor ? { cursor } : {}),
      ...(params.oldest ? { oldest: params.oldest } : {}),
      ...(params.latest ? { latest: params.latest } : {}),
      ...(params.inclusive === undefined ? {} : { inclusive: params.inclusive }),
      limit: FRESHNESS_PAGE_LIMIT,
    });
    if (!page || !Array.isArray(page.messages)) {
      throw new Error("Slack history response must contain a messages array");
    }
    for (const message of page.messages) {
      if (params.onMessage(message) === false) {
        return false;
      }
    }
    if (!page.nextCursor) {
      return true;
    }
    if (cursors.has(page.nextCursor)) {
      throw new Error("Slack history pagination did not advance");
    }
    cursors.add(page.nextCursor);
    cursor = page.nextCursor;
  }
  return false;
}

export function createHistoryReadHandler(options: {
  config: DeliberationConfig;
  openclawConfig: OpenClawConfig;
  readMessages?: HistoryReader;
  historyStore?: SourceHistoryIdentityStore;
  channelRuntime?: ChannelRuntimeSurface;
  resolveChannelHistory?: ChannelHistoryResolver;
}) {
  const discordReader = options.readMessages ?? readMessagesDiscord;
  return async (params: unknown) => {
    const request = readClosedRequest(params);
    const identity = parseSourceIdentity(request.sourceTarget);
    if (!identity || !options.config.enabled) {
      throw new Error("sourceTarget is not an enabled Deliberation source");
    }
    if (!configuredSource(options.config, identity)) {
      throw new Error("sourceTarget is not a configured Deliberation source");
    }

    if (identity.provider === "slack") {
      const providerEventId = request.schemaVersion === 2 ? request.after : request.before;
      const threadId = await resolveSlackThread({
        store: options.historyStore,
        sourceTarget: request.sourceTarget,
        providerEventId,
      });
      const resolvedContext = options.resolveChannelHistory
        ? options.resolveChannelHistory({ provider: "slack", accountId: identity.account })
        : (getChannelRuntimeContext({
            channelRuntime: options.channelRuntime,
            channelId: "slack",
            accountId: identity.account,
            capability: CHANNEL_HISTORY_RUNTIME_CONTEXT_CAPABILITY,
          }) as ChannelHistoryRuntimeContext | undefined);
      const reader = requireSlackHistoryContext(resolvedContext);
      const root = await reader.readMessage({ channelId: identity.channel, messageId: threadId });
      if (!root || root.id !== threadId) {
        throw new Error("Slack thread root is unavailable or conflicting");
      }
      normalizeSlackMessage(root, threadId);

      if (request.schemaVersion === 1) {
        const byId = new Map<string, NormalizedMessage>();
        await readSlackThread({
          reader,
          channelId: identity.channel,
          threadId,
          latest: request.before,
          inclusive: false,
          onMessage(message) {
            const normalized = normalizeSlackMessage(message, threadId);
            if (compareSlackTimestamps(normalized.providerEventId, request.before) >= 0) {
              return true;
            }
            const existing = byId.get(normalized.providerEventId);
            if (existing && !sameMessage(existing, normalized)) {
              throw new Error("Slack history response contains a conflicting message id");
            }
            byId.set(normalized.providerEventId, normalized);
            return byId.size <= HISTORY_READ_LIMIT;
          },
        });
        const messages = [...byId.values()]
          .toSorted((left, right) =>
            compareSlackTimestamps(left.providerEventId, right.providerEventId),
          )
          .slice(-HISTORY_READ_LIMIT);
        return {
          schemaVersion: 1 as const,
          sourceTarget: request.sourceTarget,
          provenance: provenance(identity),
          messages,
        };
      }

      const cutoff = request.after;
      const latestReplyId = root.latestReplyId;
      if (latestReplyId) {
        if (!isSlackTimestamp(latestReplyId)) {
          throw new Error("Slack thread watermark contains an invalid timestamp");
        }
        if (compareSlackTimestamps(latestReplyId, threadId) < 0) {
          throw new Error("Slack thread watermark precedes its root");
        }
      }
      const capturedWatermark = latestReplyId ?? threadId;
      if (compareSlackTimestamps(capturedWatermark, cutoff) <= 0) {
        return {
          schemaVersion: 2 as const,
          sourceTarget: request.sourceTarget,
          cutoffProviderEventId: cutoff,
          watermarkProviderEventId: cutoff,
          provenance: provenance(identity),
          messages: [],
          complete: true,
        };
      }

      const seen = new Map<string, NormalizedMessage>();
      const evidence = new Map<string, NormalizedMessage>();
      const traversalComplete = await readSlackThread({
        reader,
        channelId: identity.channel,
        threadId,
        oldest: cutoff,
        latest: capturedWatermark,
        inclusive: true,
        onMessage(message) {
          const normalized = normalizeSlackMessage(message, threadId);
          const existing = seen.get(normalized.providerEventId);
          if (existing && !sameMessage(existing, normalized)) {
            throw new Error("Slack history response contains a conflicting message id");
          }
          seen.set(normalized.providerEventId, normalized);
          if (compareSlackTimestamps(normalized.providerEventId, capturedWatermark) > 0) {
            throw new Error("Slack freshness response is outside captured bounds");
          }
          if (compareSlackTimestamps(normalized.providerEventId, cutoff) > 0) {
            evidence.set(normalized.providerEventId, normalized);
          }
          const bounded = boundFreshnessMessages(
            [...evidence.values()].toSorted((left, right) =>
              compareSlackTimestamps(left.providerEventId, right.providerEventId),
            ),
          );
          return bounded.complete;
        },
      });
      const ordered = [...evidence.values()].toSorted((left, right) =>
        compareSlackTimestamps(left.providerEventId, right.providerEventId),
      );
      const bounded = boundFreshnessMessages(ordered);
      return {
        schemaVersion: 2 as const,
        sourceTarget: request.sourceTarget,
        cutoffProviderEventId: cutoff,
        watermarkProviderEventId: capturedWatermark,
        provenance: provenance(identity),
        messages: bounded.messages,
        complete: traversalComplete && bounded.complete,
      };
    }

    if (identity.provider !== "discord") {
      throw new Error("sourceTarget provider is unsupported");
    }
    const providerEventId = request.schemaVersion === 2 ? request.after : request.before;
    const historyChannelId = await resolveDiscordHistoryChannel({
      store: options.historyStore,
      sourceTarget: request.sourceTarget,
      providerEventId,
      accountId: identity.account,
    });
    if (request.schemaVersion === 2) {
      const providerOpts = { cfg: options.openclawConfig, accountId: identity.account };
      const watermarkRows = await discordReader(
        historyChannelId,
        { limit: 1, after: request.after },
        providerOpts,
      );
      if (!Array.isArray(watermarkRows)) {
        throw new Error("Discord history response must be an array");
      }
      const normalizedWatermark = watermarkRows.map((message) =>
        normalizeDiscordMessage(message, historyChannelId),
      );
      const cutoff = snowflake(request.after);
      const watermark = normalizedWatermark.reduce(
        (greatest, message) =>
          snowflake(message.providerEventId) > greatest
            ? snowflake(message.providerEventId)
            : greatest,
        cutoff,
      );
      if (watermark <= cutoff) {
        return {
          schemaVersion: 2 as const,
          sourceTarget: request.sourceTarget,
          cutoffProviderEventId: request.after,
          watermarkProviderEventId: request.after,
          provenance: provenance(identity),
          messages: [],
          complete: true,
        };
      }

      const byId = new Map<string, NormalizedMessage>();
      let before = String(watermark + 1n);
      let complete = true;
      while (true) {
        const page = await discordReader(
          historyChannelId,
          { limit: FRESHNESS_PAGE_LIMIT, after: request.after, before },
          providerOpts,
        );
        if (!Array.isArray(page)) {
          throw new Error("Discord history response must be an array");
        }
        const normalized = page.map((message) =>
          normalizeDiscordMessage(message, historyChannelId),
        );
        if (normalized.length === 0) {
          break;
        }
        let oldest = snowflake(before);
        for (const message of normalized) {
          const id = snowflake(message.providerEventId);
          if (id <= cutoff || id > watermark) {
            throw new Error("Discord freshness response is outside captured bounds");
          }
          const existing = byId.get(message.providerEventId);
          if (existing && !sameMessage(existing, message)) {
            throw new Error("Discord freshness response contains a conflicting message id");
          }
          byId.set(message.providerEventId, message);
          if (id < oldest) {
            oldest = id;
          }
        }
        const ordered = [...byId.values()].toSorted((left, right) =>
          snowflake(left.providerEventId) < snowflake(right.providerEventId) ? -1 : 1,
        );
        if (
          ordered.length > FRESHNESS_MESSAGE_LIMIT ||
          Buffer.byteLength(JSON.stringify(ordered), "utf8") > FRESHNESS_BYTE_LIMIT
        ) {
          complete = false;
          break;
        }
        if (normalized.length < FRESHNESS_PAGE_LIMIT) {
          break;
        }
        if (String(oldest) === before) {
          throw new Error("Discord freshness pagination did not advance");
        }
        before = String(oldest);
      }
      const ordered = [...byId.values()].toSorted((left, right) =>
        snowflake(left.providerEventId) < snowflake(right.providerEventId) ? -1 : 1,
      );
      const bounded = boundFreshnessMessages(ordered);
      return {
        schemaVersion: 2 as const,
        sourceTarget: request.sourceTarget,
        cutoffProviderEventId: request.after,
        watermarkProviderEventId: String(watermark),
        provenance: provenance(identity),
        messages: bounded.messages,
        complete: complete && bounded.complete,
      };
    }

    const raw = await discordReader(
      historyChannelId,
      { limit: HISTORY_READ_LIMIT, before: request.before },
      { cfg: options.openclawConfig, accountId: identity.account },
    );
    if (!Array.isArray(raw)) {
      throw new Error("Discord history response must be an array");
    }
    const messages = raw
      .map((message) => normalizeDiscordMessage(message, historyChannelId))
      .toSorted(
        (left, right) =>
          left.occurredAt.localeCompare(right.occurredAt) ||
          left.providerEventId.localeCompare(right.providerEventId),
      )
      .slice(-HISTORY_READ_LIMIT);
    return {
      schemaVersion: 1 as const,
      sourceTarget: request.sourceTarget,
      provenance: provenance(identity),
      messages,
    };
  };
}
