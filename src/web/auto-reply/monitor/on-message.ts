import type { getReplyFromConfig } from "../../../auto-reply/reply.js";
import { resolveGateContext } from "../../../auto-reply/reply/gate-context.js";
import type { GateContext } from "../../../auto-reply/reply/gate-context.js";
import { classifyInboundSecurity } from "../../../auto-reply/reply/gate-security.js";
import { runGroupGate } from "../../../auto-reply/reply/group-gate.js";
import type { MsgContext } from "../../../auto-reply/templating.js";
import { loadConfig } from "../../../config/config.js";
import { logVerbose } from "../../../globals.js";
import { resolveAgentRoute } from "../../../routing/resolve-route.js";
import { buildGroupHistoryKey } from "../../../routing/session-key.js";
import { normalizeE164 } from "../../../utils.js";
import type { MentionConfig } from "../mentions.js";
import type { WebInboundMsg } from "../types.js";
import { maybeBroadcastMessage } from "./broadcast.js";
import type { EchoTracker } from "./echo.js";
import { resolveGroupActivationFor } from "./group-activation.js";
import type { GroupHistoryEntry } from "./group-gating.js";
import { applyGroupGating, recordPendingGroupHistoryEntry } from "./group-gating.js";
import { updateLastRouteInBackground } from "./last-route.js";
import { resolvePeerId } from "./peer.js";
import { processMessage } from "./process-message.js";

export function createWebOnMessageHandler(params: {
  cfg: ReturnType<typeof loadConfig>;
  verbose: boolean;
  connectionId: string;
  maxMediaBytes: number;
  groupHistoryLimit: number;
  groupHistories: Map<string, GroupHistoryEntry[]>;
  groupMemberNames: Map<string, Map<string, string>>;
  echoTracker: EchoTracker;
  backgroundTasks: Set<Promise<unknown>>;
  replyResolver: typeof getReplyFromConfig;
  replyLogger: ReturnType<(typeof import("../../../logging.js"))["getChildLogger"]>;
  baseMentionConfig: MentionConfig;
  account: { authDir?: string; accountId?: string };
}) {
  const processForRoute = async (
    msg: WebInboundMsg,
    route: ReturnType<typeof resolveAgentRoute>,
    groupHistoryKey: string,
    opts?: {
      groupHistory?: GroupHistoryEntry[];
      suppressGroupHistoryClear?: boolean;
      gateCtx?: GateContext;
    },
  ) =>
    processMessage({
      cfg: params.cfg,
      msg,
      route,
      groupHistoryKey,
      groupHistories: params.groupHistories,
      groupMemberNames: params.groupMemberNames,
      connectionId: params.connectionId,
      verbose: params.verbose,
      maxMediaBytes: params.maxMediaBytes,
      replyResolver: params.replyResolver,
      replyLogger: params.replyLogger,
      backgroundTasks: params.backgroundTasks,
      rememberSentText: params.echoTracker.rememberText,
      echoHas: params.echoTracker.has,
      echoForget: params.echoTracker.forget,
      buildCombinedEchoKey: params.echoTracker.buildCombinedKey,
      groupHistory: opts?.groupHistory,
      suppressGroupHistoryClear: opts?.suppressGroupHistoryClear,
      gateCtx: opts?.gateCtx,
    });

  return async (msg: WebInboundMsg) => {
    const conversationId = msg.conversationId ?? msg.from;
    const peerId = resolvePeerId(msg);
    // Fresh config for bindings lookup; other routing inputs are payload-derived.
    const route = resolveAgentRoute({
      cfg: loadConfig(),
      channel: "whatsapp",
      accountId: msg.accountId,
      peer: {
        kind: msg.chatType === "group" ? "group" : "direct",
        id: peerId,
      },
    });
    const groupHistoryKey =
      msg.chatType === "group"
        ? buildGroupHistoryKey({
            channel: "whatsapp",
            accountId: route.accountId,
            peerKind: "group",
            peerId,
          })
        : route.sessionKey;

    // Same-phone mode logging retained
    if (msg.from === msg.to) {
      logVerbose(`📱 Same-phone mode detected (from === to: ${msg.from})`);
    }

    // Skip if this is a message we just sent (echo detection)
    if (params.echoTracker.has(msg.body)) {
      logVerbose("Skipping auto-reply: detected echo (message matches recently sent text)");
      params.echoTracker.forget(msg.body);
      return;
    }

    // Track gateCtx at handler scope so it can be threaded to processMessage
    // for outbound security scanning. Only populated for always-on groups.
    let gateCtx: GateContext | undefined;

    if (msg.chatType === "group") {
      const metaCtx = {
        From: msg.from,
        To: msg.to,
        SessionKey: route.sessionKey,
        AccountId: route.accountId,
        ChatType: msg.chatType,
        ConversationLabel: conversationId,
        GroupSubject: msg.groupSubject,
        SenderName: msg.senderName,
        SenderId: msg.senderJid?.trim() || msg.senderE164,
        SenderE164: msg.senderE164,
        Provider: "whatsapp",
        Surface: "whatsapp",
        OriginatingChannel: "whatsapp",
        OriginatingTo: conversationId,
      } satisfies MsgContext;
      updateLastRouteInBackground({
        cfg: params.cfg,
        backgroundTasks: params.backgroundTasks,
        storeAgentId: route.agentId,
        sessionKey: route.sessionKey,
        channel: "whatsapp",
        to: conversationId,
        accountId: route.accountId,
        ctx: metaCtx,
        warn: params.replyLogger.warn.bind(params.replyLogger),
      });

      const gating = applyGroupGating({
        cfg: params.cfg,
        msg,
        conversationId,
        groupHistoryKey,
        agentId: route.agentId,
        sessionKey: route.sessionKey,
        baseMentionConfig: params.baseMentionConfig,
        authDir: params.account.authDir,
        groupHistories: params.groupHistories,
        groupHistoryLimit: params.groupHistoryLimit,
        groupMemberNames: params.groupMemberNames,
        logVerbose,
        replyLogger: params.replyLogger,
      });
      if (!gating.shouldProcess) {
        return;
      }

      // Two-phase LLM gate for always-on groups: ask a cheap model whether
      // the assistant should respond before running the full (expensive) LLM.
      const activation = resolveGroupActivationFor({
        cfg: params.cfg,
        agentId: route.agentId,
        sessionKey: route.sessionKey,
        conversationId,
      });
      if (activation === "always") {
        // Build participant roster for mention resolution in the gate prompt
        const groupRoster = params.groupMemberNames.get(conversationId);

        // Resolve shared gate context ONCE for all pipeline stages
        gateCtx = resolveGateContext({
          cfg: params.cfg,
          agentId: route.agentId,
          sessionKey: route.sessionKey,
          groupId: conversationId,
          channel: "whatsapp",
          accountId: route.accountId,
          rawMessage: msg.body,
          senderName: msg.senderName ?? msg.senderE164 ?? "Unknown",
          senderE164: msg.senderE164,
          senderJid: msg.senderJid,
          activation,
          mentionedJids: msg.mentionedJids,
          participantRoster: groupRoster,
          rawParticipants: msg.groupParticipants,
        });

        // Security gate: classify inbound message for social engineering
        const securityResult = classifyInboundSecurity(gateCtx);
        if (securityResult.flagged) {
          logVerbose(
            `Security gate flagged inbound (reason: ${securityResult.reason}) in ${conversationId}`,
          );
          recordPendingGroupHistoryEntry({
            msg,
            groupHistories: params.groupHistories,
            groupHistoryKey,
            groupHistoryLimit: params.groupHistoryLimit,
          });
          return;
        }

        // Relevance gate: uses pre-resolved GateContext (no duplicate context loading)
        const gateResult = await runGroupGate({
          ctx: gateCtx,
          cfg: params.cfg,
        });
        if (!gateResult.shouldRespond) {
          logVerbose(
            `Group gate blocked response (reason: ${gateResult.reason}) in ${conversationId}`,
          );
          recordPendingGroupHistoryEntry({
            msg,
            groupHistories: params.groupHistories,
            groupHistoryKey,
            groupHistoryLimit: params.groupHistoryLimit,
          });
          return;
        }
      }
    } else {
      // Ensure `peerId` for DMs is stable and stored as E.164 when possible.
      if (!msg.senderE164 && peerId && peerId.startsWith("+")) {
        msg.senderE164 = normalizeE164(peerId) ?? msg.senderE164;
      }
    }

    // Broadcast groups: when we'd reply anyway, run multiple agents.
    // Does not bypass group mention/activation gating above.
    if (
      await maybeBroadcastMessage({
        cfg: params.cfg,
        msg,
        peerId,
        route,
        groupHistoryKey,
        groupHistories: params.groupHistories,
        processMessage: processForRoute,
      })
    ) {
      return;
    }

    await processForRoute(msg, route, groupHistoryKey, { gateCtx });
  };
}
