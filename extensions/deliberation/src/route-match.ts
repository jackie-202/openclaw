import { routeKey, type DeliberationConfig, type DeliberationRoute } from "./config.js";

type RouteCandidate = {
  channelId?: string;
  channel?: string;
  accountId?: string;
  conversationId?: string;
  target?: string;
};

export function candidateRoute(candidate: RouteCandidate): DeliberationRoute | undefined {
  const channel = candidate.channelId ?? candidate.channel;
  const runtimeTarget = candidate.conversationId ?? candidate.target;
  const target = runtimeTarget?.startsWith("channel:")
    ? runtimeTarget.slice("channel:".length)
    : runtimeTarget;
  if (channel !== "discord" || !candidate.accountId || !target) {
    return undefined;
  }
  return { channel, accountId: candidate.accountId, target };
}

export function matchesSource(config: DeliberationConfig, candidate: RouteCandidate): boolean {
  const route = candidateRoute(candidate);
  return route ? config.sourceKeys.has(routeKey(route)) : false;
}
