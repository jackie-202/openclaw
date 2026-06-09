import type { ChannelRuntimeProfileConfig } from "../config/types.channels.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import {
  parseRawSessionConversationRef,
  parseThreadSessionSuffix,
} from "../sessions/session-key-utils.js";
import {
  normalizeOptionalLowercaseString,
  normalizeOptionalString,
} from "../shared/string-coerce.js";
import { normalizeMessageChannel } from "../utils/message-channel.js";
import {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  type ChannelMatchSource,
} from "./channel-config.js";
import { normalizeChatType } from "./chat-type.js";
import { getChannelPlugin } from "./plugins/registry.js";
import {
  resolveSessionConversation,
  resolveSessionConversationRef,
} from "./plugins/session-conversation.js";

export type ChannelModelOverride = {
  channel: string;
  model: string;
  matchKey?: string;
  matchSource?: ChannelMatchSource;
};

export type ChannelRuntimeProfileOverride = {
  channel: string;
  model?: string;
  thinkingLevel?: string;
  reasoningLevel?: string;
  textVerbosity?: string;
  matchKey?: string;
  matchSource?: ChannelMatchSource;
};

type ChannelModelByChannelConfig = Record<string, Record<string, string>>;
type ChannelRuntimeByChannelConfig = Record<string, Record<string, ChannelRuntimeProfileConfig>>;

type ChannelModelOverrideParams = {
  cfg: OpenClawConfig;
  channel?: string | null;
  groupId?: string | null;
  groupChatType?: string | null;
  groupChannel?: string | null;
  groupSubject?: string | null;
  parentSessionKey?: string | null;
};

function resolveProviderEntry<T>(
  entriesByChannel: Record<string, Record<string, T>> | undefined,
  channel: string,
): Record<string, T> | undefined {
  const normalized =
    normalizeMessageChannel(channel) ?? normalizeOptionalLowercaseString(channel) ?? "";
  return (
    entriesByChannel?.[normalized] ??
    entriesByChannel?.[
      Object.keys(entriesByChannel ?? {}).find((key) => {
        const normalizedKey =
          normalizeMessageChannel(key) ?? normalizeOptionalLowercaseString(key) ?? "";
        return normalizedKey === normalized;
      }) ?? ""
    ]
  );
}

function buildChannelCandidates(
  params: Pick<
    ChannelModelOverrideParams,
    "channel" | "groupId" | "groupChatType" | "groupChannel" | "groupSubject" | "parentSessionKey"
  >,
): { keys: string[]; parentKeys: string[] } {
  const normalizedChannel =
    normalizeMessageChannel(params.channel ?? "") ??
    normalizeOptionalLowercaseString(params.channel);
  const groupId = normalizeOptionalString(params.groupId);
  const rawParentConversation = parseRawSessionConversationRef(params.parentSessionKey);
  const channelPlugin = normalizedChannel ? getChannelPlugin(normalizedChannel) : undefined;
  const parentOverrideFallbacks =
    channelPlugin?.conversationBindings?.buildModelOverrideParentCandidates?.({
      parentConversationId: rawParentConversation?.rawId,
    }) ?? [];
  const sessionConversation = resolveSessionConversationRef(params.parentSessionKey, {
    bundledFallback: parentOverrideFallbacks.length === 0,
  });
  const groupConversationKind =
    normalizeChatType(params.groupChatType ?? undefined) === "channel"
      ? "channel"
      : sessionConversation?.kind === "channel"
        ? "channel"
        : "group";
  const groupConversation = resolveSessionConversation({
    channel: normalizedChannel ?? "",
    kind: groupConversationKind,
    rawId: groupId ?? "",
  });
  const groupChannel = normalizeOptionalString(params.groupChannel);
  const groupSubject = normalizeOptionalString(params.groupSubject);
  const channelBare = groupChannel ? groupChannel.replace(/^#/, "") : undefined;
  const subjectBare = groupSubject ? groupSubject.replace(/^#/, "") : undefined;
  const channelSlug = channelBare ? normalizeChannelSlug(channelBare) : undefined;
  const subjectSlug = subjectBare ? normalizeChannelSlug(subjectBare) : undefined;

  return {
    keys: buildChannelKeyCandidates(
      groupId,
      sessionConversation?.rawId,
      ...(groupConversation?.parentConversationCandidates ?? []),
      ...(sessionConversation?.parentConversationCandidates ?? []),
      ...parentOverrideFallbacks,
    ),
    parentKeys: buildChannelKeyCandidates(
      groupChannel,
      channelBare,
      channelSlug,
      groupSubject,
      subjectBare,
      subjectSlug,
    ),
  };
}

function buildGenericParentOverrideCandidates(sessionKey: string | null | undefined): string[] {
  const raw = parseRawSessionConversationRef(sessionKey);
  if (!raw) {
    return [];
  }
  const { baseSessionKey, threadId } = parseThreadSessionSuffix(raw.rawId);
  return buildChannelKeyCandidates(threadId ? baseSessionKey : raw.rawId);
}

function resolveDirectChannelEntryMatch<T>(params: {
  channel: string;
  providerEntries: Record<string, T>;
  groupId?: string | null;
  parentSessionKey?: string | null;
}): { entry: T; matchKey?: string; matchSource?: ChannelMatchSource } | null {
  const directKeys = buildChannelKeyCandidates(
    params.groupId,
    ...buildGenericParentOverrideCandidates(params.parentSessionKey),
  );
  if (directKeys.length === 0) {
    return null;
  }
  const match = resolveChannelEntryMatchWithFallback({
    entries: params.providerEntries,
    keys: directKeys,
    parentKeys: [],
    wildcardKey: "*",
    normalizeKey: (value) => normalizeOptionalLowercaseString(value) ?? "",
  });
  const raw = match.entry ?? match.wildcardEntry;
  if (raw === undefined) {
    return null;
  }
  return { entry: raw, matchKey: match.matchKey, matchSource: match.matchSource };
}

function resolveChannelEntryMatch<T>(
  params: ChannelModelOverrideParams,
  providerEntries: Record<string, T> | undefined,
): { entry: T; matchKey?: string; matchSource?: ChannelMatchSource } | null {
  const channel = normalizeOptionalString(params.channel);
  if (!channel || !providerEntries) {
    return null;
  }
  const directMatch = resolveDirectChannelEntryMatch({
    channel,
    providerEntries,
    groupId: params.groupId,
    parentSessionKey: params.parentSessionKey,
  });
  if (directMatch) {
    return directMatch;
  }

  const { keys, parentKeys } = buildChannelCandidates(params);
  if (keys.length === 0 && parentKeys.length === 0) {
    return null;
  }
  const match = resolveChannelEntryMatchWithFallback({
    entries: providerEntries,
    keys,
    parentKeys,
    wildcardKey: "*",
    normalizeKey: (value) => normalizeOptionalLowercaseString(value) ?? "",
  });
  const raw = match.entry ?? match.wildcardEntry;
  if (raw === undefined) {
    return null;
  }
  return { entry: raw, matchKey: match.matchKey, matchSource: match.matchSource };
}

function normalizeRuntimeProfileEntry(
  entry: ChannelRuntimeProfileConfig | undefined,
): Omit<ChannelRuntimeProfileOverride, "channel" | "matchKey" | "matchSource"> {
  if (!entry) {
    return {};
  }
  return {
    ...(normalizeOptionalString(entry.model)
      ? { model: normalizeOptionalString(entry.model) }
      : {}),
    ...(normalizeOptionalString(entry.thinkingLevel)
      ? { thinkingLevel: normalizeOptionalString(entry.thinkingLevel) }
      : {}),
    ...(normalizeOptionalString(entry.reasoningLevel)
      ? { reasoningLevel: normalizeOptionalString(entry.reasoningLevel) }
      : {}),
    ...(normalizeOptionalString(entry.textVerbosity)
      ? { textVerbosity: normalizeOptionalString(entry.textVerbosity) }
      : {}),
  };
}

export function resolveChannelRuntimeProfile(
  params: ChannelModelOverrideParams,
): ChannelRuntimeProfileOverride | null {
  const channel = normalizeOptionalString(params.channel);
  if (!channel) {
    return null;
  }
  const normalizedChannel =
    normalizeMessageChannel(channel) ?? normalizeOptionalLowercaseString(channel) ?? "";
  const runtimeByChannel = params.cfg.channels?.runtimeByChannel as
    | ChannelRuntimeByChannelConfig
    | undefined;
  const modelByChannel = params.cfg.channels?.modelByChannel as
    | ChannelModelByChannelConfig
    | undefined;
  const runtimeMatch = resolveChannelEntryMatch(
    params,
    resolveProviderEntry(runtimeByChannel, channel),
  );
  const legacyModelMatch = resolveChannelEntryMatch(
    params,
    resolveProviderEntry(modelByChannel, channel),
  );
  const runtimeProfile = normalizeRuntimeProfileEntry(runtimeMatch?.entry);
  const legacyModel =
    typeof legacyModelMatch?.entry === "string"
      ? normalizeOptionalString(legacyModelMatch.entry)
      : undefined;
  const model = runtimeProfile.model ?? legacyModel;
  if (
    !model &&
    !runtimeProfile.thinkingLevel &&
    !runtimeProfile.reasoningLevel &&
    !runtimeProfile.textVerbosity
  ) {
    return null;
  }

  return {
    channel: normalizedChannel,
    ...(model ? { model } : {}),
    ...(runtimeProfile.thinkingLevel ? { thinkingLevel: runtimeProfile.thinkingLevel } : {}),
    ...(runtimeProfile.reasoningLevel ? { reasoningLevel: runtimeProfile.reasoningLevel } : {}),
    ...(runtimeProfile.textVerbosity ? { textVerbosity: runtimeProfile.textVerbosity } : {}),
    matchKey: runtimeMatch?.matchKey ?? legacyModelMatch?.matchKey,
    matchSource: runtimeMatch?.matchSource ?? legacyModelMatch?.matchSource,
  };
}

export function resolveChannelModelOverride(
  params: ChannelModelOverrideParams,
): ChannelModelOverride | null {
  const runtimeProfile = resolveChannelRuntimeProfile(params);
  if (!runtimeProfile?.model) {
    return null;
  }
  return {
    channel: runtimeProfile.channel,
    model: runtimeProfile.model,
    matchKey: runtimeProfile.matchKey,
    matchSource: runtimeProfile.matchSource,
  };
}
