import type {
  PluginHookInboundClaimContext,
  PluginHookInboundClaimEvent,
  PluginLogger,
} from "openclaw/plugin-sdk/plugin-entry";
import { routeKey, type DeliberationConfig } from "./config.js";
import { KmRequestError, type KmClient } from "./km-client.js";
import { candidateRoute, matchesSource } from "./route-match.js";

type BeforeDispatchContext = {
  channelId?: string;
  accountId?: string;
  conversationId?: string;
};

const MIME_TYPE_PATTERN = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i;

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
) {
  const processingRouteKey = routeKey(config.processingSource);
  return async (event: PluginHookInboundClaimEvent, ctx: PluginHookInboundClaimContext) => {
    if (!config.enabled) {
      logger.debug?.("deliberation intake skipped: reason=disabled");
      return { handled: false };
    }
    const route = candidateRoute(ctx);
    if (route && routeKey(route) === processingRouteKey) {
      logger.debug?.("deliberation intake skipped: reason=processing-route");
      return { handled: false };
    }
    if (!route || !config.sourceKeys.has(routeKey(route))) {
      logger.debug?.("deliberation intake skipped: reason=unmatched-route");
      return { handled: false };
    }
    const messageId = ctx.messageId ?? event.messageId;
    const senderId = ctx.senderId ?? event.senderId;
    if (!messageId) {
      logger.debug?.("deliberation intake skipped: reason=missing-message-id");
      return { handled: false };
    }
    if (!senderId) {
      logger.debug?.("deliberation intake skipped: reason=missing-sender-id");
      return { handled: false };
    }
    const content = resolveIntakeContent(event);
    if (!content) {
      logger.debug?.("deliberation intake skipped: reason=empty-content");
      return { handled: false };
    }
    try {
      const occurredAt = canonicalUtcTimestamp(new Date(event.timestamp ?? Date.now()));
      const receivedAt = canonicalUtcTimestamp(new Date());
      await client.intake({
        provider: "discord",
        providerEventId: messageId,
        sourceTarget: `discord:channel:${route.target}`,
        senderId,
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

export function createBeforeDispatchHandler(config: DeliberationConfig) {
  // Config/KM disablement stops v2 work, but source silence remains fail-closed;
  // otherwise an outage or cutover pause would leak pilot traffic to ordinary dispatch.
  return (_event: unknown, ctx: BeforeDispatchContext) =>
    matchesSource(config, ctx) ? { handled: true } : undefined;
}
