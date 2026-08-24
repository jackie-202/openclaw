// Channel inbound contracts define plugin ingress payloads and reply dispatch metadata.
import {
  buildChannelInboundEventContext,
  finalizeChannelInboundContext,
  filterChannelInboundQuoteContext,
  filterChannelInboundSupplementalContext,
  resolveChannelInboundSupplementalContext,
  type BuildChannelInboundEventContextAsyncParams,
  type BuildChannelInboundEventContextParams,
  type BuiltChannelInboundEventContext,
  type ChannelInboundSupplementalResolutionOptions,
  type FinalizeChannelInboundContextAsyncParams,
  type FinalizeChannelInboundContextParams,
  type FinalizeChannelInboundContextResult,
} from "../channels/inbound-event/context.js";
import type { InboundEventKind } from "../channels/inbound-event/kind.js";
import type {
  PluginHookInboundClaimContext,
  PluginHookInboundClaimEvent,
} from "../plugins/hook-message.types.js";
import { getGlobalHookRunner } from "../plugins/hook-runner-global.js";
import type {
  PluginHookInboundClaimResult,
  PluginHookInboundEventPolicyDecision,
  PluginHookInboundEventPolicyEvent,
} from "../plugins/hook-types.js";

export type ChannelInboundEventPolicyFacts = PluginHookInboundEventPolicyEvent;
export type ChannelInboundEventPolicyDecision = PluginHookInboundEventPolicyDecision;

export type ChannelInboundExclusiveClaimResult =
  | { kind: "continue" }
  | {
      kind: "terminal";
      reason:
        | "ambiguous_owner"
        | "runner_unavailable"
        | "handled"
        | "declined"
        | "missing_plugin"
        | "no_handler"
        | "error";
      ownerPluginId?: string;
      result?: PluginHookInboundClaimResult;
    };

export function resolveChannelInboundEventPolicy(
  event: ChannelInboundEventPolicyFacts,
): ChannelInboundEventPolicyDecision {
  return getGlobalHookRunner()?.runInboundEventPolicy(event) ?? { kind: "ordinary" };
}

export async function claimChannelInboundEvent(params: {
  policy: ChannelInboundEventPolicyDecision;
  event: PluginHookInboundClaimEvent;
  context: PluginHookInboundClaimContext;
  log?: (message: string) => void;
}): Promise<ChannelInboundExclusiveClaimResult> {
  if (params.policy.kind === "ordinary" || params.policy.kind === "separate") {
    return { kind: "continue" };
  }
  if (params.policy.kind === "ambiguous") {
    params.log?.("inbound exclusive claim stopped: reason=ambiguous_owner");
    return { kind: "terminal", reason: "ambiguous_owner" };
  }

  const ownerPluginId = params.policy.ownerPluginId;
  const runner = getGlobalHookRunner();
  if (!runner) {
    params.log?.(
      `inbound exclusive claim stopped: owner=${ownerPluginId} reason=runner_unavailable`,
    );
    return { kind: "terminal", reason: "runner_unavailable", ownerPluginId };
  }
  const outcome = await runner.runInboundClaimForPluginOutcome(
    ownerPluginId,
    params.event,
    params.context,
  );
  params.log?.(`inbound exclusive claim stopped: owner=${ownerPluginId} reason=${outcome.status}`);
  return {
    kind: "terminal",
    reason: outcome.status,
    ownerPluginId,
    ...(outcome.status === "handled" ? { result: outcome.result } : {}),
  };
}

export {
  createInboundDebouncer,
  resolveInboundDebounceMs,
} from "../auto-reply/inbound-debounce.js";
export {
  createDirectDmPreCryptoGuardPolicy,
  createPreCryptoDirectDmAuthorizer,
  dispatchInboundDirectDmWithRuntime,
  resolveInboundDirectDmAccessWithRuntime,
  type AccessGroupMembershipResolver,
  type DirectDmCommandAuthorizationRuntime,
  type DirectDmPreCryptoGuardPolicy,
  type DirectDmPreCryptoGuardPolicyOverrides,
  type ResolvedInboundDirectDmAccess,
} from "../channels/direct-dm.js";
export {
  formatInboundEnvelope,
  formatInboundFromLabel,
  resolveEnvelopeFormatOptions,
} from "../auto-reply/envelope.js";
export type { EnvelopeFormatOptions } from "../auto-reply/envelope.js";
export {
  buildMentionRegexes,
  matchesMentionPatterns,
  matchesMentionWithExplicit,
  normalizeMentionText,
  type BuildMentionRegexesOptions,
} from "../auto-reply/reply/mentions.js";
export {
  resolveMentionPatternPolicy,
  type ResolveMentionPatternPolicyParams,
  type ResolvedMentionPatternPolicy,
} from "../channels/mention-pattern-policy.js";
export {
  createChannelInboundDebouncer,
  shouldDebounceTextInbound,
} from "../channels/inbound-debounce-policy.js";
export type {
  InboundMentionFacts,
  InboundMentionPolicy,
  InboundImplicitMentionKind,
  InboundMentionDecision,
  MentionGateParams,
  MentionGateResult,
  MentionGateWithBypassParams,
  MentionGateWithBypassResult,
  ResolveInboundMentionDecisionFlatParams,
  ResolveInboundMentionDecisionNestedParams,
  ResolveInboundMentionDecisionParams,
} from "../channels/mention-gating.js";
export {
  implicitMentionKindWhen,
  resolveInboundMentionDecision,
  // @deprecated Prefer `resolveInboundMentionDecision({ facts, policy })`.
  resolveMentionGating,
  // @deprecated Prefer `resolveInboundMentionDecision({ facts, policy })`.
  resolveMentionGatingWithBypass,
} from "../channels/mention-gating.js";
export type { LocationSource, NormalizedLocation } from "../channels/location.js";
export { formatLocationText, toLocationContext } from "../channels/location.js";
export type { LogFn } from "../channels/logging.js";
export { logInboundDrop } from "../channels/logging.js";
export { resolveInboundSessionEnvelopeContext } from "../channels/session-envelope.js";
export {
  classifyChannelInboundEvent,
  resolveUnmentionedGroupInboundPolicy,
} from "../channels/inbound-event/classification.js";
export type { ClassifyChannelInboundEventParams } from "../channels/inbound-event/classification.js";
export {
  buildChannelInboundEventContext,
  // @deprecated Prefer `buildChannelInboundEventContext`.
  finalizeChannelInboundContext,
  filterChannelInboundQuoteContext,
  filterChannelInboundSupplementalContext,
  // @deprecated Prefer `buildChannelInboundEventContext({ resolveSupplementalMedia: true })`.
  resolveChannelInboundSupplementalContext,
};
export type {
  BuildChannelInboundEventContextAsyncParams,
  BuildChannelInboundEventContextParams,
  BuiltChannelInboundEventContext,
  ChannelInboundSupplementalResolutionOptions,
  FinalizeChannelInboundContextAsyncParams,
  FinalizeChannelInboundContextParams,
  FinalizeChannelInboundContextResult,
};
/**
 * Deprecated turn-context input alias that still accepts the old `inboundTurnKind` name.
 *
 * @deprecated Use `BuildChannelInboundEventContextParams`.
 */
export type BuildChannelTurnContextParams = Omit<
  BuildChannelInboundEventContextParams,
  "message"
> & {
  message: BuildChannelInboundEventContextParams["message"] & {
    inboundTurnKind?: InboundEventKind;
  };
};
/**
 * Deprecated turn-context result alias with the historical `InboundTurnKind` field.
 *
 * @deprecated Use `BuiltChannelInboundEventContext`.
 */
export type BuiltChannelTurnContext = BuiltChannelInboundEventContext & {
  InboundTurnKind: InboundEventKind;
};

/**
 * Builds inbound-event context for callers still passing `inboundTurnKind`.
 *
 * @deprecated Use `buildChannelInboundEventContext`.
 */
export function buildChannelTurnContext(
  params: BuildChannelTurnContextParams,
): BuiltChannelTurnContext {
  const inboundEventKind = params.message.inboundEventKind ?? params.message.inboundTurnKind;
  // Normalize the legacy turn-kind field before delegating so downstream context builders
  // only need to preserve the current inbound-event contract.
  const ctx = buildChannelInboundEventContext({
    ...params,
    message: {
      ...params.message,
      ...(inboundEventKind ? { inboundEventKind } : {}),
    },
  });
  return {
    ...ctx,
    InboundTurnKind: ctx.InboundEventKind,
  };
}

/**
 * Deprecated supplemental-context filter alias retained for channel SDK compatibility.
 *
 * @deprecated Use `filterChannelInboundSupplementalContext`.
 */
export const filterChannelTurnSupplementalContext = filterChannelInboundSupplementalContext;
export {
  runChannelInboundEvent,
  runPreparedInboundReply,
  dispatchChannelInboundReply,
  recordDroppedChannelInboundHistory,
  dispatchReplyFromConfigWithSettledDispatcher,
  hasFinalInboundReplyDispatch,
  hasVisibleInboundReplyDispatch,
  recordChannelBotPairLoopAndCheckSuppression,
  resolveInboundReplyDispatchCounts,
} from "../channels/message/inbound-reply-dispatch.js";
export type {
  AssembledInboundReply,
  ChannelBotLoopProtectionFacts,
  ChannelInboundEventRunnerParams,
  ChannelInboundDroppedHistoryOptions,
  PreparedInboundReply,
  InboundReplyDispatchResult,
  InboundReplyRecordOptions,
} from "../channels/message/inbound-reply-dispatch.js";

export {
  toHistoryMediaEntries,
  toInboundMediaFacts,
  buildChannelInboundMediaPayload,
  // @deprecated Prefer `buildChannelInboundMediaPayload`.
  buildChannelInboundMediaPayload as buildChannelTurnMediaPayload,
} from "../channels/inbound-event/media.js";
export type {
  ChannelInboundMediaInput,
  ChannelInboundMediaInput as ChannelTurnMediaInput,
  ChannelInboundMediaPayload,
  ChannelInboundMediaPayload as ChannelTurnMediaPayload,
} from "../channels/inbound-event/media.js";
export type {
  CommandFacts,
  InboundMediaFacts,
  SupplementalContextFacts,
} from "../channels/turn/types.js";
export type { InboundEventKind } from "../channels/inbound-event/kind.js";
export type { InboundEventKind as InboundTurnKind } from "../channels/inbound-event/kind.js";
export {
  createCommandTurnContext,
  isAuthorizedTextSlashCommandTurn,
  isExplicitCommandTurn,
  isNativeCommandTurn,
  isTextSlashCommandTurn,
} from "../auto-reply/command-turn-context.js";
export type { CommandTurnContext } from "../auto-reply/command-turn-context.js";
export { mergeInboundPathRoots } from "@openclaw/media-core/inbound-path-policy";
