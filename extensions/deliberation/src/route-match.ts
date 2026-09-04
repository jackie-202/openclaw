import {
  routeKey,
  type DeliberationConfig,
  type DeliberationPipeline,
  type DeliberationRoute,
} from "./config.js";
import type { KmWireDeliveryTarget } from "./km-client.js";
import { compareSlackTimestamps, isSlackTimestamp } from "./slack-timestamp.js";
import { encodeSourceIdentity } from "./source-identity.js";

const SOURCE_THREAD_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,95}$/;

type RouteCandidate = {
  channelId?: unknown;
  channel?: unknown;
  accountId?: unknown;
  conversationId?: unknown;
  parentConversationId?: unknown;
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
      pipeline: DeliberationPipeline;
      pipelineId: string;
      deliveryTarget: KmWireDeliveryTarget;
      route: DeliberationRoute;
      sourceTarget: string;
      providerEventId: string;
      sourceThreadId: string;
      historyChannelId: string;
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
  const parentConversationId = normalizedTarget(candidate.parentConversationId);
  const targetValue = normalizedTarget(candidate.target);
  const directTarget = agreedValue(conversationId, targetValue);
  const target = channel === "discord" ? (parentConversationId ?? directTarget) : directTarget;
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

function pipelineTargetToWire(
  pipeline: DeliberationPipeline,
  route: DeliberationRoute,
  deliveryThreadId?: string,
): KmWireDeliveryTarget {
  const target = pipeline.target;
  return target
    ? {
        provider: target.channel,
        account: target.accountId,
        channel: target.target,
        ...(target.threadId === undefined ? {} : { threadId: target.threadId }),
      }
    : {
        provider: route.channel,
        account: route.accountId,
        channel: route.target,
        ...(deliveryThreadId === undefined ? {} : { threadId: deliveryThreadId }),
      };
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
  const directTarget = agreedValue(...targets);
  const rawParents = [event.parentConversationId, context.parentConversationId];
  const parents = rawParents.map(normalizedTarget);
  if (rawParents.some((value, index) => value !== undefined && parents[index] === undefined)) {
    return { accepted: false, reason: "malformed-route" };
  }
  const parentTarget = agreedValue(...parents);
  if (rawParents.some((value) => value !== undefined) && !parentTarget) {
    return { accepted: false, reason: "ambiguous-route" };
  }
  if (!isSupportedProvider(channel) || !accountId || !directTarget) {
    return { accepted: false, reason: "ambiguous-route" };
  }
  const providerEventId = agreedValue(event.messageId, context.messageId);
  if (!providerEventId) {
    return { accepted: false, reason: "missing-message-id" };
  }
  const threadId = agreedValue(event.threadId, context.threadId);
  if ((event.threadId !== undefined || context.threadId !== undefined) && threadId === undefined) {
    return { accepted: false, reason: "malformed-message-id" };
  }
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
  if (channel === "slack" && parentTarget !== undefined && parentTarget !== directTarget) {
    return { accepted: false, reason: "ambiguous-route" };
  }
  if (channel === "discord" && parentTarget === directTarget) {
    return { accepted: false, reason: "ambiguous-route" };
  }
  if (channel === "discord" && threadId !== undefined && parentTarget === undefined) {
    return { accepted: false, reason: "ambiguous-route" };
  }
  if (
    channel === "discord" &&
    parentTarget !== undefined &&
    threadId !== undefined &&
    threadId !== directTarget
  ) {
    return { accepted: false, reason: "ambiguous-route" };
  }
  const normalizedThreadId =
    channel === "slack" && threadId
      ? threadId
      : channel === "discord" && parentTarget
        ? directTarget
        : providerEventId;
  if (!SOURCE_THREAD_ID_PATTERN.test(normalizedThreadId)) {
    return { accepted: false, reason: "malformed-message-id" };
  }
  const senderId = agreedValue(event.senderId, context.senderId);
  if (!senderId) {
    return { accepted: false, reason: "missing-sender-id" };
  }
  const routeTarget = channel === "discord" ? (parentTarget ?? directTarget) : directTarget;
  const route = { channel, accountId, target: routeTarget } satisfies DeliberationRoute;
  if (routeKey(route) === routeKey(config.processingSource)) {
    return { accepted: false, reason: "processing-route" };
  }
  const pipeline = config.pipelineBySourceKey.get(routeKey(route));
  if (!pipeline) {
    return { accepted: false, reason: "unmatched-route" };
  }
  const sourceTarget = encodeSourceIdentity({
    provider: route.channel,
    account: route.accountId,
    channel: route.target,
  });
  const deliveryThreadId = channel === "slack" || parentTarget ? normalizedThreadId : undefined;
  return sourceTarget
    ? {
        accepted: true,
        pipeline,
        pipelineId: pipeline.id,
        deliveryTarget: pipelineTargetToWire(pipeline, route, deliveryThreadId),
        route,
        sourceTarget,
        providerEventId,
        sourceThreadId: normalizedThreadId,
        historyChannelId: directTarget,
        ...(channel === "slack" ? { threadId: normalizedThreadId } : {}),
        senderId,
      }
    : { accepted: false, reason: "malformed-route" };
}

export function matchesSource(config: DeliberationConfig, candidate: RouteCandidate): boolean {
  const route = candidateRoute(candidate);
  return route ? config.pipelineBySourceKey.has(routeKey(route)) : false;
}
