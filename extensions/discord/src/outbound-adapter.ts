// Discord plugin module implements outbound adapter behavior.
import type { OutboundIdentity } from "openclaw/plugin-sdk/channel-outbound";
import { resolveOutboundSendDep } from "openclaw/plugin-sdk/channel-outbound";
import {
  type ChannelOutboundAdapter,
  type ChannelOutboundTextAttemptResult,
  createAttachedChannelResultAdapter,
} from "openclaw/plugin-sdk/channel-send-result";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contracts";
import {
  normalizeOptionalString,
  normalizeOptionalStringifiedId,
} from "openclaw/plugin-sdk/string-coerce-runtime";
import { chunkDiscordTextWithMode } from "./chunk.js";
import { withDiscordDeliveryRetry } from "./delivery-retry.js";
import { notifyDiscordInboundEventOutboundPayloadSuccess } from "./inbound-event-delivery.js";
import { DiscordError, RateLimitError } from "./internal/discord.js";
import { isLikelyDiscordVideoMedia } from "./media-detection.js";
import type { ThreadBindingRecord } from "./monitor/thread-bindings.js";
import { normalizeDiscordOutboundTarget } from "./normalize.js";
import { normalizeDiscordApprovalPayload } from "./outbound-approval.js";
import { buildDiscordPresentationPayload } from "./outbound-components.js";
import { sendDiscordOutboundPayload } from "./outbound-payload.js";
import {
  loadDiscordSendRuntime,
  resolveDiscordFormattingOptions,
  resolveDiscordOutboundTarget,
  type DiscordSendFn,
  type DiscordVoiceSendFn,
} from "./outbound-send-context.js";

export const DISCORD_TEXT_CHUNK_LIMIT = 2000;
const DISCORD_NONCE_MAX_LENGTH = 25;
const DISCORD_INTERNAL_RUNTIME_SCAFFOLDING_BLOCK_RE =
  /<\s*(system-reminder|previous_response)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const DISCORD_INTERNAL_RUNTIME_SCAFFOLDING_SELF_CLOSING_RE =
  /<\s*(?:system-reminder|previous_response)\b[^>]*\/\s*>/gi;
const DISCORD_INTERNAL_RUNTIME_SCAFFOLDING_TAG_RE =
  /<\s*\/?\s*(?:system-reminder|previous_response)\b[^>]*>/gi;

function stripDiscordInternalRuntimeScaffolding(text: string): string {
  return text
    .replace(DISCORD_INTERNAL_RUNTIME_SCAFFOLDING_BLOCK_RE, "")
    .replace(DISCORD_INTERNAL_RUNTIME_SCAFFOLDING_SELF_CLOSING_RE, "")
    .replace(DISCORD_INTERNAL_RUNTIME_SCAFFOLDING_TAG_RE, "");
}

function requireDiscordChannelId(to: string): string {
  const channelId = to.startsWith("channel:") ? to.slice("channel:".length) : to;
  if (!channelId) {
    throw new Error("Discord source thread delivery requires a channel target");
  }
  return channelId;
}

type DiscordThreadBindingsModule = typeof import("./monitor/thread-bindings.js");

let discordThreadBindingsPromise: Promise<DiscordThreadBindingsModule> | undefined;

function loadDiscordThreadBindings(): Promise<DiscordThreadBindingsModule> {
  discordThreadBindingsPromise ??= import("./monitor/thread-bindings.js");
  return discordThreadBindingsPromise;
}

function resolveDiscordWebhookIdentity(params: {
  identity?: OutboundIdentity;
  binding: ThreadBindingRecord;
}): { username?: string; avatarUrl?: string } {
  const usernameRaw = normalizeOptionalString(params.identity?.name);
  const fallbackUsername = normalizeOptionalString(params.binding.label) ?? params.binding.agentId;
  const username = (usernameRaw || fallbackUsername || "").slice(0, 80) || undefined;
  const avatarUrl = normalizeOptionalString(params.identity?.avatarUrl);
  return { username, avatarUrl };
}

type DiscordWebhookRoute = {
  binding: ThreadBindingRecord & { webhookId: string; webhookToken: string };
  username?: string;
  avatarUrl?: string;
};

type DiscordOutboundAdapter = ChannelOutboundAdapter & {
  sendTextAttempt: NonNullable<ChannelOutboundAdapter["sendTextAttempt"]>;
};

async function resolveDiscordWebhookRoute(params: {
  threadId?: string | number | null;
  accountId?: string | null;
  identity?: OutboundIdentity;
  silent?: boolean;
}): Promise<DiscordWebhookRoute | null> {
  if (params.silent || params.threadId == null) {
    return null;
  }
  const threadId = normalizeOptionalStringifiedId(params.threadId) ?? "";
  if (!threadId) {
    return null;
  }
  const { getThreadBindingManager } = await loadDiscordThreadBindings();
  const binding = getThreadBindingManager(params.accountId ?? undefined)?.getByThreadId(threadId);
  if (!binding?.webhookId || !binding.webhookToken) {
    return null;
  }
  return {
    binding: binding as ThreadBindingRecord & { webhookId: string; webhookToken: string },
    ...resolveDiscordWebhookIdentity({ identity: params.identity, binding }),
  };
}

async function maybeSendDiscordWebhookText(params: {
  cfg: OpenClawConfig;
  text: string;
  threadId?: string | number | null;
  accountId?: string | null;
  identity?: OutboundIdentity;
  replyToId?: string | null;
}): Promise<{ messageId: string; channelId: string } | null> {
  const route = await resolveDiscordWebhookRoute(params);
  if (!route) {
    return null;
  }
  const { binding } = route;
  const { sendWebhookMessageDiscord } = await loadDiscordSendRuntime();
  const result = await sendWebhookMessageDiscord(params.text, {
    webhookId: binding.webhookId,
    webhookToken: binding.webhookToken,
    accountId: binding.accountId,
    threadId: binding.threadId,
    cfg: params.cfg,
    replyTo: params.replyToId ?? undefined,
    username: route.username,
    avatarUrl: route.avatarUrl,
  });
  return result;
}

async function resolveDiscordSourceThreadTarget(params: {
  cfg: OpenClawConfig;
  to: string;
  sourceMessageId: string;
  accountId?: string | null;
}): Promise<string> {
  const channelId = requireDiscordChannelId(params.to);
  const runtime = await loadDiscordSendRuntime();
  const opts = { cfg: params.cfg, accountId: params.accountId ?? undefined };
  try {
    const thread = await runtime.createThreadDiscord(
      channelId,
      { messageId: params.sourceMessageId, name: "Deliberation" },
      opts,
    );
    return `channel:${thread.id}`;
  } catch (creationError) {
    const sourceMessage = await runtime
      .fetchMessageDiscord(channelId, params.sourceMessageId, opts)
      .catch(() => undefined);
    const threadId = sourceMessage?.thread?.id;
    if (!threadId) {
      throw creationError;
    }
    return `channel:${threadId}`;
  }
}

function formatDiscordAttemptError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function classifyDiscordAttemptError(
  error: unknown,
  idempotency: "native" | "unsupported",
): ChannelOutboundTextAttemptResult {
  const status =
    error && typeof error === "object" && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined;
  const discordCode =
    error && typeof error === "object" && "discordCode" in error
      ? Number((error as { discordCode?: unknown }).discordCode)
      : undefined;
  const message = formatDiscordAttemptError(error);
  if (error instanceof RateLimitError || status === 429) {
    return { outcome: "rejected", failureClass: "rate_limit", error: message, idempotency };
  }
  if (status === 401 || status === 403 || discordCode === 50013) {
    return { outcome: "rejected", failureClass: "permission", error: message, idempotency };
  }
  if (error instanceof DiscordError && status !== undefined && status >= 400 && status < 500) {
    return { outcome: "rejected", failureClass: "rejection", error: message, idempotency };
  }
  if (
    (error instanceof Error && error.name === "AbortError") ||
    /\b(?:timed out|timeout)\b/i.test(message)
  ) {
    return { outcome: "unknown", failureClass: "timeout", error: message, idempotency };
  }
  if (
    error instanceof TypeError ||
    /\b(?:fetch failed|network|socket|connection)\b/i.test(message)
  ) {
    return { outcome: "unknown", failureClass: "transport", error: message, idempotency };
  }
  return { outcome: "unknown", failureClass: "unknown", error: message, idempotency };
}

export const discordOutbound: DiscordOutboundAdapter = {
  deliveryMode: "direct",
  chunker: (text, limit, ctx) =>
    chunkDiscordTextWithMode(text, {
      maxChars: limit,
      maxLines: ctx?.formatting?.maxLinesPerMessage,
    }),
  textChunkLimit: DISCORD_TEXT_CHUNK_LIMIT,
  sanitizeText: ({ text }) => stripDiscordInternalRuntimeScaffolding(text),
  pollMaxOptions: 10,
  normalizePayload: ({ payload }) => normalizeDiscordApprovalPayload(payload),
  presentationCapabilities: {
    supported: true,
    buttons: true,
    selects: true,
    context: true,
    divider: true,
    limits: {
      actions: {
        maxActions: 25,
        maxActionsPerRow: 5,
        maxRows: 5,
        maxLabelLength: 80,
        supportsDisabled: true,
      },
      selects: {
        maxOptions: 25,
        maxLabelLength: 100,
        maxValueBytes: 100,
      },
      text: {
        maxLength: DISCORD_TEXT_CHUNK_LIMIT,
        encoding: "characters",
        markdownDialect: "discord-markdown",
      },
    },
  },
  deliveryCapabilities: {
    durableFinal: {
      text: true,
      media: true,
      poll: true,
      payload: true,
      silent: true,
      replyTo: true,
      thread: true,
      messageSendingHooks: true,
    },
  },
  renderPresentation: async ({ payload, presentation }) => {
    return await buildDiscordPresentationPayload({
      payload,
      presentation,
    });
  },
  resolveTarget: ({ to, allowFrom }) => normalizeDiscordOutboundTarget(to, allowFrom),
  sendPayload: async (ctx) =>
    await sendDiscordOutboundPayload({
      ctx,
      fallbackAdapter: discordOutbound,
    }),
  sendTextAttempt: async (ctx) => {
    const webhookRoute = await resolveDiscordWebhookRoute({
      ...ctx,
      threadId: ctx.sourceMessageId ? undefined : ctx.threadId,
    });
    const idempotency = webhookRoute ? "unsupported" : "native";
    const runtime = await loadDiscordSendRuntime();
    const preparedText = runtime.renderDiscordOutboundText({
      cfg: ctx.cfg,
      text: ctx.text,
      accountId: ctx.accountId ?? undefined,
    });
    if (!preparedText.trim()) {
      return {
        outcome: "rejected",
        failureClass: "rejection",
        error: "Message must be non-empty for Discord sends",
        idempotency,
      };
    }
    if (preparedText.length > DISCORD_TEXT_CHUNK_LIMIT) {
      return {
        outcome: "rejected",
        failureClass: "rejection",
        error: `Discord rendered text exceeds ${DISCORD_TEXT_CHUNK_LIMIT} characters`,
        idempotency,
      };
    }
    if (ctx.idempotencyKey.length < 1 || ctx.idempotencyKey.length > DISCORD_NONCE_MAX_LENGTH) {
      return {
        outcome: "rejected",
        failureClass: "rejection",
        error: `Discord idempotency key must contain 1-${DISCORD_NONCE_MAX_LENGTH} characters`,
        idempotency,
      };
    }

    try {
      const target = ctx.sourceMessageId
        ? await resolveDiscordSourceThreadTarget({
            cfg: ctx.cfg,
            to: ctx.to,
            sourceMessageId: ctx.sourceMessageId,
            accountId: ctx.accountId,
          })
        : resolveDiscordOutboundTarget({ to: ctx.to, threadId: ctx.threadId });
      const result = webhookRoute
        ? await runtime.sendWebhookMessageDiscord(preparedText, {
            webhookId: webhookRoute.binding.webhookId,
            webhookToken: webhookRoute.binding.webhookToken,
            accountId: webhookRoute.binding.accountId,
            threadId: webhookRoute.binding.threadId,
            cfg: ctx.cfg,
            replyTo: ctx.replyToId ?? undefined,
            username: webhookRoute.username,
            avatarUrl: webhookRoute.avatarUrl,
            preparedText: true,
          })
        : await runtime.sendTextAttemptDiscord(target, preparedText, {
            cfg: ctx.cfg,
            accountId: ctx.accountId ?? undefined,
            replyTo: ctx.replyToId ?? undefined,
            silent: ctx.silent,
            idempotencyKey: ctx.idempotencyKey,
          });
      return {
        outcome: "sent",
        messageId: result.messageId,
        receipt: result.receipt,
        idempotency,
      };
    } catch (error) {
      return classifyDiscordAttemptError(error, idempotency);
    }
  },
  sendTextToSourceThread: async ({ cfg, to, text, sourceMessageId, accountId, formatting }) => {
    const target = await resolveDiscordSourceThreadTarget({ cfg, to, sourceMessageId, accountId });
    const runtime = await loadDiscordSendRuntime();
    const result = await runtime.sendMessageDiscord(target, text, {
      verbose: false,
      accountId: accountId ?? undefined,
      cfg,
      ...resolveDiscordFormattingOptions({ formatting }),
    });
    return { channel: "discord", ...result };
  },
  ...createAttachedChannelResultAdapter({
    channel: "discord",
    sendText: async ({
      cfg,
      to,
      text,
      accountId,
      deps,
      replyToId,
      threadId,
      identity,
      silent,
      formatting,
    }) => {
      if (!silent) {
        const webhookResult = await maybeSendDiscordWebhookText({
          cfg,
          text,
          threadId,
          accountId,
          identity,
          replyToId,
        }).catch(() => null);
        if (webhookResult) {
          return webhookResult;
        }
      }
      const send =
        resolveOutboundSendDep<DiscordSendFn>(deps, "discord") ??
        (await loadDiscordSendRuntime()).sendMessageDiscord;
      return await withDiscordDeliveryRetry({
        cfg,
        accountId,
        fn: async () =>
          await send(resolveDiscordOutboundTarget({ to, threadId }), text, {
            verbose: false,
            replyTo: replyToId ?? undefined,
            accountId: accountId ?? undefined,
            silent: silent ?? undefined,
            cfg,
            ...resolveDiscordFormattingOptions({ formatting }),
          }),
      });
    },
    sendMedia: async ({
      cfg,
      to,
      text,
      mediaUrl,
      audioAsVoice,
      mediaAccess,
      mediaLocalRoots,
      mediaReadFile,
      accountId,
      deps,
      replyToId,
      threadId,
      silent,
      formatting,
    }) => {
      const send =
        resolveOutboundSendDep<DiscordSendFn>(deps, "discord") ??
        (await loadDiscordSendRuntime()).sendMessageDiscord;
      const target = resolveDiscordOutboundTarget({ to, threadId });
      const formattingOptions = resolveDiscordFormattingOptions({ formatting });
      if (audioAsVoice && mediaUrl) {
        const sendVoice =
          resolveOutboundSendDep<DiscordVoiceSendFn>(deps, "discordVoice") ??
          (await loadDiscordSendRuntime()).sendVoiceMessageDiscord;
        return await withDiscordDeliveryRetry({
          cfg,
          accountId,
          fn: async () =>
            await sendVoice(target, mediaUrl, {
              cfg,
              replyTo: replyToId ?? undefined,
              accountId: accountId ?? undefined,
              silent: silent ?? undefined,
            }),
        });
      }
      if (text.trim() && mediaUrl && isLikelyDiscordVideoMedia(mediaUrl)) {
        await withDiscordDeliveryRetry({
          cfg,
          accountId,
          fn: async () =>
            await send(target, text, {
              verbose: false,
              replyTo: replyToId ?? undefined,
              accountId: accountId ?? undefined,
              silent: silent ?? undefined,
              cfg,
              ...formattingOptions,
            }),
        });
        return await withDiscordDeliveryRetry({
          cfg,
          accountId,
          fn: async () =>
            await send(target, "", {
              verbose: false,
              mediaUrl,
              mediaAccess,
              mediaLocalRoots,
              mediaReadFile,
              accountId: accountId ?? undefined,
              silent: silent ?? undefined,
              cfg,
              ...formattingOptions,
            }),
        });
      }
      return await withDiscordDeliveryRetry({
        cfg,
        accountId,
        fn: async () =>
          await send(target, text, {
            verbose: false,
            mediaUrl,
            mediaAccess,
            mediaLocalRoots,
            mediaReadFile,
            replyTo: replyToId ?? undefined,
            accountId: accountId ?? undefined,
            silent: silent ?? undefined,
            cfg,
            ...formattingOptions,
          }),
      });
    },
    sendPoll: async ({ cfg, to, poll, accountId, threadId, silent }) =>
      await withDiscordDeliveryRetry({
        cfg,
        accountId,
        fn: async () =>
          await (
            await loadDiscordSendRuntime()
          ).sendPollDiscord(resolveDiscordOutboundTarget({ to, threadId }), poll, {
            accountId: accountId ?? undefined,
            silent: silent ?? undefined,
            cfg,
          }),
      }),
  }),
  afterDeliverPayload: async ({ target, payload }) => {
    notifyDiscordInboundEventOutboundPayloadSuccess({
      payload,
      to: resolveDiscordOutboundTarget({ to: target.to, threadId: target.threadId }),
      accountId: target.accountId,
    });
    const threadId = normalizeOptionalStringifiedId(target.threadId);
    if (!threadId) {
      return;
    }
    const { getThreadBindingManager } = await loadDiscordThreadBindings();
    const manager = getThreadBindingManager(target.accountId ?? undefined);
    if (!manager?.getByThreadId(threadId)) {
      return;
    }
    manager.touchThread({ threadId });
  },
};
