import { routeKey, type DeliberationConfig, type DeliberationRoute } from "./config.js";
import { compareSlackTimestamps, isSlackTimestamp } from "./slack-timestamp.js";
import { encodeSourceIdentity } from "./source-identity.js";

const SOURCE_THREAD_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,95}$/;

type RouteCandidate = {
  channelId?: unknown;
  channel?: unknown;
  accountId?: unknown;
  conversationId?: unknown;
  target?: unknown;
};

type InboundCandidate = RouteCandidate & {
  provider?: unknown;
  eventType?: unknown;
  eventKind?: unknown;
  messageId?: unknown;
  senderId?: unknown;
  threadId?: unknown;
};

export type SourceAdmission =
  | {
      accepted: true;
      route: DeliberationRoute;
      sourceTarget: string;
      providerEventId: string;
      sourceThreadId: string;
      threadId?: string;
      senderId: string;
    }
  | { accepted: false; reason: string };

function normalizedTarget(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) {
    return undefined;
  }
  const target = value.startsWith("channel:") ? value.slice("channel:".length) : value;
  return encodeSourceIdentity({ provider: "discord", account: "default", channel: target })
    ? target
    : undefined;
}

function isSupportedProvider(value: unknown): value is DeliberationRoute["channel"] {
  return value === "discord" || value === "slack";
}

function agreedValue(...values: unknown[]): string | undefined {
  const present = values.filter((value) => value !== undefined);
  const first = present[0];
  return typeof first === "string" && present.every((value) => value === first) ? first : undefined;
}

export function candidateRoute(candidate: RouteCandidate): DeliberationRoute | undefined {
  const channel = agreedValue(candidate.channelId, candidate.channel);
  const accountId = agreedValue(candidate.accountId);
  const conversationId = normalizedTarget(candidate.conversationId);
  const targetValue = normalizedTarget(candidate.target);
  const target = agreedValue(conversationId, targetValue);
  if (!isSupportedProvider(channel) || !accountId || !target) {
    return undefined;
  }
  const sourceTarget = encodeSourceIdentity({
    provider: channel,
    account: accountId,
    channel: target,
  });
  return sourceTarget ? { channel, accountId, target } : undefined;
}

export function admitInboundSource(
  config: DeliberationConfig,
  event: InboundCandidate,
  context: InboundCandidate,
): SourceAdmission {
  if (!isSupportedProvider(event.provider) || event.eventType !== "message") {
    return { accepted: false, reason: "unsupported-event" };
  }
  if (event.eventKind !== "user_request") {
    return { accepted: false, reason: "unsupported-kind" };
  }
  const channel = agreedValue(event.provider, event.channel, context.channelId, context.channel);
  const accountId = agreedValue(event.accountId, context.accountId);
  const rawTargets = [event.conversationId, event.target, context.conversationId, context.target];
  const targets = rawTargets.map(normalizedTarget);
  if (rawTargets.some((value, index) => value !== undefined && targets[index] === undefined)) {
    return { accepted: false, reason: "malformed-route" };
  }
  const target = agreedValue(...targets);
  if (!isSupportedProvider(channel) || !accountId || !target) {
    return { accepted: false, reason: "ambiguous-route" };
  }
  const providerEventId = agreedValue(event.messageId, context.messageId);
  if (!providerEventId) {
    return { accepted: false, reason: "missing-message-id" };
  }
  const threadId = event.threadId;
  if (
    channel === "slack" &&
    (!isSlackTimestamp(providerEventId) ||
      (threadId !== undefined &&
        (typeof threadId !== "string" ||
          !isSlackTimestamp(threadId) ||
          compareSlackTimestamps(threadId, providerEventId) > 0)))
  ) {
    return { accepted: false, reason: "malformed-message-id" };
  }
  const normalizedThreadId =
    channel === "slack" && typeof threadId === "string" ? threadId : providerEventId;
  if (!SOURCE_THREAD_ID_PATTERN.test(normalizedThreadId)) {
    return { accepted: false, reason: "malformed-message-id" };
  }
  const senderId = agreedValue(event.senderId, context.senderId);
  if (!senderId) {
    return { accepted: false, reason: "missing-sender-id" };
  }
  const route = { channel, accountId, target } satisfies DeliberationRoute;
  if (routeKey(route) === routeKey(config.processingSource)) {
    return { accepted: false, reason: "processing-route" };
  }
  if (!config.sourceKeys.has(routeKey(route))) {
    return { accepted: false, reason: "unmatched-route" };
  }
  const sourceTarget = encodeSourceIdentity({
    provider: route.channel,
    account: route.accountId,
    channel: route.target,
  });
  return sourceTarget
    ? {
        accepted: true,
        route,
        sourceTarget,
        providerEventId,
        sourceThreadId: normalizedThreadId,
        ...(channel === "slack" ? { threadId: normalizedThreadId } : {}),
        senderId,
      }
    : { accepted: false, reason: "malformed-route" };
}

export function matchesSource(config: DeliberationConfig, candidate: RouteCandidate): boolean {
  const route = candidateRoute(candidate);
  return route ? config.sourceKeys.has(routeKey(route)) : false;
}
