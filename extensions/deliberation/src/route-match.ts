import { routeKey, type DeliberationConfig, type DeliberationRoute } from "./config.js";
import { encodeSourceIdentity } from "./source-identity.js";

type RouteCandidate = {
  channelId?: string;
  channel?: string;
  accountId?: string;
  conversationId?: string;
  target?: string;
};

type InboundCandidate = RouteCandidate & {
  provider?: string;
  eventType?: string;
  eventKind?: string;
  messageId?: string;
  senderId?: string;
};

export type SourceAdmission =
  | {
      accepted: true;
      route: DeliberationRoute;
      sourceTarget: string;
      providerEventId: string;
      senderId: string;
    }
  | { accepted: false; reason: string };

function normalizedTarget(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const target = value.startsWith("channel:") ? value.slice("channel:".length) : value;
  return encodeSourceIdentity({ provider: "discord", account: "default", channel: target })
    ? target
    : undefined;
}

function agreedValue(...values: Array<string | undefined>): string | undefined {
  const present = values.filter((value): value is string => value !== undefined);
  return present.length > 0 && present.every((value) => value === present[0])
    ? present[0]
    : undefined;
}

export function candidateRoute(candidate: RouteCandidate): DeliberationRoute | undefined {
  const channel = agreedValue(candidate.channelId, candidate.channel);
  const accountId = candidate.accountId;
  const conversationId = normalizedTarget(candidate.conversationId);
  const targetValue = normalizedTarget(candidate.target);
  const target = agreedValue(conversationId, targetValue);
  if (channel !== "discord" || !accountId || !target) {
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
  if (event.provider !== "discord" || event.eventType !== "message") {
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
  if (channel !== "discord" || !accountId || !target) {
    return { accepted: false, reason: "ambiguous-route" };
  }
  const providerEventId = agreedValue(event.messageId, context.messageId);
  if (!providerEventId) {
    return { accepted: false, reason: "missing-message-id" };
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
    ? { accepted: true, route, sourceTarget, providerEventId, senderId }
    : { accepted: false, reason: "malformed-route" };
}

export function matchesSource(config: DeliberationConfig, candidate: RouteCandidate): boolean {
  const route = candidateRoute(candidate);
  return route ? config.sourceKeys.has(routeKey(route)) : false;
}
