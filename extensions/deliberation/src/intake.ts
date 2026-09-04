import type {
  PluginHookInboundClaimContext,
  PluginHookInboundClaimEvent,
  PluginLogger,
} from "openclaw/plugin-sdk/plugin-entry";
import type { DeliberationConfig } from "./config.js";
import { KmRequestError, type KmClient } from "./km-client.js";
import { admitInboundSource, matchesSource } from "./route-match.js";
import {
  registerDiscordHistoryIdentity,
  registerSlackThreadIdentity,
  type SourceHistoryIdentityStore,
} from "./thread-identity-store.js";

type BeforeDispatchContext = {
  channelId?: string;
  accountId?: string;
  conversationId?: string;
  parentConversationId?: string;
};

const MIME_TYPE_PATTERN = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i;
const MAX_SENDER_HINT_BYTES = 128;
const MAX_SENDER_ALIASES = 8;
const MAX_SENDER_HINTS_BYTES = 2048;

function hasControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f);
  });
}

function normalizeSenderHint(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  if (
    !normalized ||
    hasControlCharacter(normalized) ||
    Buffer.byteLength(normalized, "utf8") > MAX_SENDER_HINT_BYTES
  ) {
    return undefined;
  }
  return normalized;
}

function resolveSenderIdentityHints(event: PluginHookInboundClaimEvent) {
  const senderDisplayName = normalizeSenderHint(event.senderName);
  const senderUsername = normalizeSenderHint(event.senderUsername);
  const seen = new Set(
    [senderDisplayName, senderUsername]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLocaleLowerCase("en-US")),
  );
  const senderAliases: string[] = [];
  for (const candidate of event.senderAliases ?? []) {
    const alias = normalizeSenderHint(candidate);
    const key = alias?.toLocaleLowerCase("en-US");
    if (!alias || !key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    senderAliases.push(alias);
    if (senderAliases.length === MAX_SENDER_ALIASES) {
      break;
    }
  }
  const hints = {
    ...(senderDisplayName ? { senderDisplayName } : {}),
    ...(senderUsername ? { senderUsername } : {}),
    ...(senderAliases.length > 0 ? { senderAliases } : {}),
  };
  if (Object.keys(hints).length === 0) {
    return undefined;
  }
  return Buffer.byteLength(JSON.stringify(hints), "utf8") <= MAX_SENDER_HINTS_BYTES
    ? hints
    : undefined;
}

function canonicalUtcTimestamp(date: Date): string {
  const timestamp = date.toISOString();
  return timestamp.endsWith(".000Z")
    ? timestamp.replace(".000Z", "Z")
    : timestamp.replace("Z", "000Z");
}

function metadataStrings(metadata: Record<string, unknown>, field: string): string[] {
  const value = metadata[field];
  if (typeof value === "string" && value.length > 0) {
    return [value];
  }
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function resolveIntakeContent(event: PluginHookInboundClaimEvent): string | undefined {
  if (event.content.trim().length > 0) {
    return event.content;
  }
  const metadata = event.metadata ?? {};
  const mediaTypes = [
    ...metadataStrings(metadata, "mediaType"),
    ...metadataStrings(metadata, "mediaTypes"),
  ];
  const hasAttachment = [
    ...mediaTypes,
    ...metadataStrings(metadata, "mediaPath"),
    ...metadataStrings(metadata, "mediaPaths"),
    ...metadataStrings(metadata, "mediaUrl"),
    ...metadataStrings(metadata, "mediaUrls"),
  ].length;
  if (!hasAttachment) {
    return undefined;
  }
  const mediaType = mediaTypes.find((value) => MIME_TYPE_PATTERN.test(value));
  return mediaType ? `[media: ${mediaType}]` : "[media attachment]";
}

export function createInboundClaimHandler(
  config: DeliberationConfig,
  client: KmClient,
  logger: PluginLogger,
  historyStore?: SourceHistoryIdentityStore,
) {
  // Discord compares authenticated botUserId with author.id before this hook.
  // No authoritative self fact reaches plugins, so admission must not guess from display metadata.
  return async (event: PluginHookInboundClaimEvent, ctx: PluginHookInboundClaimContext) => {
    if (!config.enabled) {
      logger.debug?.("deliberation intake skipped: reason=disabled");
      return { handled: false };
    }
    const admission = admitInboundSource(config, event, ctx);
    if (!admission.accepted) {
      logger.debug?.(`deliberation intake skipped: reason=${admission.reason}`);
      return { handled: false };
    }
    const content = resolveIntakeContent(event);
    if (!content) {
      logger.debug?.("deliberation intake skipped: reason=empty-content");
      return { handled: false };
    }
    try {
      if (!historyStore) {
        throw new Error("Source history identity store is unavailable");
      }
      if (admission.route.channel === "slack") {
        await registerSlackThreadIdentity(historyStore, {
          sourceTarget: admission.sourceTarget,
          providerEventId: admission.providerEventId,
          threadId: admission.sourceThreadId,
        });
      } else {
        await registerDiscordHistoryIdentity(historyStore, {
          provider: "discord",
          sourceTarget: admission.sourceTarget,
          providerEventId: admission.providerEventId,
          historyChannelId: admission.historyChannelId,
        });
      }
      const occurredAt = canonicalUtcTimestamp(new Date(event.timestamp ?? Date.now()));
      const receivedAt = canonicalUtcTimestamp(new Date());
      const senderIdentityHints = resolveSenderIdentityHints(event);
      await client.intake({
        pipelineId: admission.pipelineId,
        deliveryTarget: admission.deliveryTarget,
        provider: admission.route.channel,
        providerEventId: admission.providerEventId,
        sourceTarget: admission.sourceTarget,
        sourceThreadId: admission.sourceThreadId,
        senderId: admission.senderId,
        ...(senderIdentityHints ? { senderIdentityHints } : {}),
        occurredAt,
        receivedAt,
        content,
        eventType: "message",
      });
      return { handled: true };
    } catch (error) {
      // Intake is fail-closed by the independent before_dispatch hook.
      const errorType = error instanceof Error ? "Error" : "Unknown";
      const diagnostic =
        error instanceof KmRequestError
          ? ` stage=${error.stage}${error.status === undefined ? "" : ` status=${error.status}`} code=${error.code}`
          : "";
      logger.warn(
        `deliberation intake failed: reason=km-request-failed${diagnostic} error=${errorType}`,
      );
    }
    return { handled: false };
  };
}

export function createInboundEventPolicyHandler(config: DeliberationConfig) {
  return (event: {
    provider: string;
    accountId: string;
    conversationId: string;
    parentConversationId?: string;
    providerEventId?: string;
  }) =>
    matchesSource(config, { ...event, channelId: event.provider })
      ? { aggregation: "separate" as const, dispatch: "exclusive" as const }
      : undefined;
}

export function createBeforeDispatchHandler(config: DeliberationConfig) {
  // Config/KM disablement stops v2 work, but source silence remains fail-closed;
  // otherwise an outage or cutover pause would leak pilot traffic to ordinary dispatch.
  return (_event: unknown, ctx: BeforeDispatchContext) =>
    matchesSource(config, ctx) ? { handled: true } : undefined;
}
