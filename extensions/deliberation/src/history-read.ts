import {
  readMessagesDiscord,
  type DiscordHistoryMessage,
  type OpenClawConfig,
} from "openclaw/plugin-sdk/discord";
import type { DeliberationConfig } from "./config.js";
import { encodeSourceIdentity, parseSourceIdentity } from "./source-identity.js";

export const HISTORY_READ_METHOD = "deliberation.history.read";
export const HISTORY_READ_LIMIT = 20;
const FRESHNESS_PAGE_LIMIT = 50;
const FRESHNESS_MESSAGE_LIMIT = 50;
const FRESHNESS_BYTE_LIMIT = 32 * 1024;

type HistoryReader = (
  channelId: string,
  query: { limit: number; before?: string; after?: string },
  opts: { cfg: OpenClawConfig; accountId: string },
) => Promise<DiscordHistoryMessage[]>;

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
      !/^\d+$/.test(request.after)
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
  if (!/^\d+$/.test(value))
    throw new Error("Discord history response contains an invalid snowflake");
  return BigInt(value);
}

function normalizeMessage(message: DiscordHistoryMessage) {
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
    eventType: "message" as const,
    occurredAt: occurredAt.toISOString(),
    content: message.content,
  };
}

export function createHistoryReadHandler(options: {
  config: DeliberationConfig;
  openclawConfig: OpenClawConfig;
  readMessages?: HistoryReader;
}) {
  const reader = options.readMessages ?? readMessagesDiscord;
  return async (params: unknown) => {
    const request = readClosedRequest(params);
    const identity = parseSourceIdentity(request.sourceTarget);
    if (!identity || identity.provider !== "discord" || options.config.enabled !== true) {
      throw new Error("sourceTarget is not an enabled Discord source");
    }
    const routes = options.config.sources.filter(
      (candidate) =>
        encodeSourceIdentity({
          provider: candidate.channel,
          account: candidate.accountId,
          channel: candidate.target,
        }) === request.sourceTarget,
    );
    if (routes.length !== 1) {
      throw new Error("sourceTarget is not a configured Deliberation source");
    }
    if (request.schemaVersion === 2) {
      const providerOpts = { cfg: options.openclawConfig, accountId: identity.account };
      const watermarkRows = await reader(
        identity.channel,
        { limit: 1, after: request.after },
        providerOpts,
      );
      if (!Array.isArray(watermarkRows))
        throw new Error("Discord history response must be an array");
      const normalizedWatermark = watermarkRows.map(normalizeMessage);
      const cutoff = snowflake(request.after);
      const watermark = normalizedWatermark.reduce(
        (greatest, message) =>
          snowflake(message.providerEventId) > greatest
            ? snowflake(message.providerEventId)
            : greatest,
        cutoff,
      );
      const provenance = {
        provider: identity.provider,
        account: identity.account,
        channel: identity.channel,
      };
      if (watermark <= cutoff) {
        return {
          schemaVersion: 2 as const,
          sourceTarget: request.sourceTarget,
          cutoffProviderEventId: request.after,
          watermarkProviderEventId: request.after,
          provenance,
          messages: [],
          complete: true,
        };
      }

      const byId = new Map<string, ReturnType<typeof normalizeMessage>>();
      let before = String(watermark + 1n);
      let complete = true;
      while (true) {
        const page = await reader(
          identity.channel,
          { limit: FRESHNESS_PAGE_LIMIT, after: request.after, before },
          providerOpts,
        );
        if (!Array.isArray(page)) throw new Error("Discord history response must be an array");
        const normalized = page.map(normalizeMessage);
        if (normalized.length === 0) break;
        let oldest = snowflake(before);
        for (const message of normalized) {
          const id = snowflake(message.providerEventId);
          if (id <= cutoff || id > watermark)
            throw new Error("Discord freshness response is outside captured bounds");
          const existing = byId.get(message.providerEventId);
          if (existing && JSON.stringify(existing) !== JSON.stringify(message)) {
            throw new Error("Discord freshness response contains a conflicting message id");
          }
          byId.set(message.providerEventId, message);
          if (id < oldest) oldest = id;
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
        if (normalized.length < FRESHNESS_PAGE_LIMIT) break;
        if (String(oldest) === before)
          throw new Error("Discord freshness pagination did not advance");
        before = String(oldest);
      }
      const messages = [...byId.values()]
        .toSorted((left, right) =>
          snowflake(left.providerEventId) < snowflake(right.providerEventId) ? -1 : 1,
        )
        .slice(-FRESHNESS_MESSAGE_LIMIT);
      return {
        schemaVersion: 2 as const,
        sourceTarget: request.sourceTarget,
        cutoffProviderEventId: request.after,
        watermarkProviderEventId: String(watermark),
        provenance,
        messages,
        complete,
      };
    }
    const raw = await reader(
      identity.channel,
      { limit: HISTORY_READ_LIMIT, before: request.before },
      { cfg: options.openclawConfig, accountId: identity.account },
    );
    if (!Array.isArray(raw)) {
      throw new Error("Discord history response must be an array");
    }
    const messages = raw
      .map(normalizeMessage)
      .toSorted(
        (left, right) =>
          left.occurredAt.localeCompare(right.occurredAt) ||
          left.providerEventId.localeCompare(right.providerEventId),
      )
      .slice(-HISTORY_READ_LIMIT);
    return {
      schemaVersion: 1 as const,
      sourceTarget: request.sourceTarget,
      provenance: {
        provider: identity.provider,
        account: identity.account,
        channel: identity.channel,
      },
      messages,
    };
  };
}
