/**
 * Two-phase LLM gate for always-on group chats.
 *
 * Phase 1 (this file): a cheap/fast model call reads the conversation history
 * plus the new inbound message and decides whether the assistant should respond.
 * Only if the gate says "yes" does the normal Phase 2 (full LLM run) proceed.
 */

import fs from "node:fs";
import { completeSimple, type TextContent } from "@mariozechner/pi-ai";
import { resolveAgentWorkspaceDir } from "../../agents/agent-scope.js";
import { DEFAULT_PROVIDER } from "../../agents/defaults.js";
import { getApiKeyForModel, requireApiKey } from "../../agents/model-auth.js";
import { parseModelRef } from "../../agents/model-selection.js";
import { resolveModel } from "../../agents/pi-embedded-runner/model.js";
import type { OpenClawConfig } from "../../config/config.js";
import { resolveChannelGroupPolicy } from "../../config/group-policy.js";
import {
  loadSessionStore,
  resolveSessionFilePath,
  resolveSessionFilePathOptions,
  resolveStorePath,
} from "../../config/sessions.js";
import { createSubsystemLogger } from "../../logging/subsystem.js";
import type { GateContext } from "./gate-context.js";
import { loadGroupKnowledgeFiles, resolveGroupKnowledgeFiles } from "./group-context-priming.js";

const log = createSubsystemLogger("group-gate");

const DEFAULT_HISTORY_LIMIT = 20;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_GATE_MODEL = "copilot/gpt-4o-mini";

/**
 * Relevance signals extracted from the gate decision.
 * Used downstream by Voice gate to calibrate response style and length.
 */
export type RelevanceSignals = {
  /** Agent was directly addressed (by name, @mention, or reply-to). */
  directAddress: boolean;
  /** Message is in a topic area where the agent has demonstrated expertise. */
  topicExpertise: boolean;
  /** Agent has been silent for many messages -- re-engagement opportunity. */
  silenceBreaker: boolean;
  /** This message is a follow-up to something the agent said previously. */
  followUp: boolean;
};

export type GroupGateResult = {
  shouldRespond: boolean;
  reason: string;
  /**
   * Structured relevance signals for downstream stages.
   * Undefined when gate is skipped, errors, or model omits them.
   */
  relevanceSignals?: RelevanceSignals;
};

type GroupGateConfig = NonNullable<NonNullable<OpenClawConfig["agents"]>["defaults"]>["groupGate"];

/**
 * Read the last N user/assistant messages from a session JSONL file and format
 * them as a readable transcript (sender: message).
 */
export function readRecentSessionTranscript(sessionFilePath: string, limit: number): string[] {
  try {
    const content = fs.readFileSync(sessionFilePath, "utf-8");
    const lines = content.trim().split("\n");

    const messages: string[] = [];
    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as {
          type?: string;
          message?: {
            role?: string;
            content?: string | Array<{ type: string; text?: string }>;
          };
        };
        if (entry.type === "message" && entry.message) {
          const msg = entry.message;
          const role = msg.role;
          if ((role === "user" || role === "assistant") && msg.content) {
            const text = Array.isArray(msg.content)
              ? msg.content.find((c) => c.type === "text")?.text
              : msg.content;
            if (text) {
              const label = role === "assistant" ? "Assistant" : "User";
              messages.push(`${label}: ${text}`);
            }
          }
        }
      } catch {
        // Skip invalid JSON lines
      }
    }

    return messages.slice(-limit);
  } catch {
    return [];
  }
}

/**
 * Build the structured gate prompt that asks the cheap model whether the
 * assistant should respond to the latest group message.
 */
function buildGatePrompt(
  transcript: string[],
  newSender: string,
  newMessage: string,
  gateMemory?: string,
): string {
  const historyBlock =
    transcript.length > 0 ? transcript.join("\n") : "(No prior conversation history)";
  const gateMemoryBlock = gateMemory?.trim()
    ? `\n## Gate Decision Memory (distilled lessons, treat as hard constraints):\n${gateMemory.trim()}\n`
    : "";

  return `You are deciding whether an AI participant ("Jackie") in a group chat should respond to the latest message. Read the full conversation, understand the social dynamics, and make a judgment call — like a human would in a group chat.

## Conversation History (last ${transcript.length} messages):
${historyBlock}

## New Message:
${newSender}: ${newMessage}
${gateMemoryBlock}
## How to decide:

Read the conversation flow. Consider:
- Is someone trying to get Jackie's attention or input? (could be @mention, name, or contextual)
- Would a human participant naturally chime in here, or would they stay quiet?
- Has Jackie already said what needs to be said on this topic?
- Is this part of an exchange where Jackie is actively involved, or is it side conversation?
- Would responding add genuine value, or would it be noise?

Think about it like this: you're Jackie's social awareness. A good group chat participant knows when to speak and when to listen. Sometimes an @mention is a real summon ("Jackie, what do you think?"). Sometimes it's just people talking about you ("Jackie musel odbranchovat openclaw"). Sometimes a message without any mention still clearly wants your input. Read the room.

Pay attention to Jackie's SILENCE pattern in the history. If Jackie hasn't responded for many messages in a row, the threshold for responding should get LOWER — people might be wondering why Jackie is quiet. Comments like "we overdid the silence" or "is Jackie even here?" or indirect references to Jackie's absence are social signals to re-engage. A long silence followed by someone mentioning Jackie (even in third person) often means "hey, say something."

Patterns that usually warrant a response:
- Direct questions or requests aimed at Jackie (by name, @mention, or context)
- Follow-up questions to something Jackie said
- Jackie can add information nobody else has covered
- The conversation shifted to a topic where Jackie has relevant expertise

Patterns that usually don't:
- People chatting about Jackie in third person (narrative, not address) when they're clearly just explaining context to someone else
- Reactions, acknowledgments, emoji, short affirmations
- Shared links or media with no question

But these are patterns, not rules. Use judgment. A single "hm" after Jackie's long explanation might warrant a "need me to clarify?" — or it might not. Context matters.

## Default bias: LEAN TOWARDS YES

When in doubt, respond. It's better to occasionally say something unnecessary than to ignore a question directed at you. Silence in a group chat when someone expects your input is worse than one extra message.

Specifically: if someone asks a question and Jackie has relevant information or context that others in the chat likely don't have — respond, even if the question wasn't explicitly addressed to Jackie by name. In a small group, most questions are for whoever can answer them.

## Response Format (JSON only, no other text):
{"shouldRespond": true/false, "reason": "brief explanation", "signals": {"directAddress": true/false, "topicExpertise": true/false, "silenceBreaker": true/false, "followUp": true/false}}`;
}

/**
 * Parse the gate model's response text into a structured result.
 * Tolerant of minor formatting issues (extra whitespace, markdown fencing, etc.).
 */
function parseGateResponse(text: string): GroupGateResult {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as {
      shouldRespond?: unknown;
      reason?: unknown;
      signals?: {
        directAddress?: unknown;
        topicExpertise?: unknown;
        silenceBreaker?: unknown;
        followUp?: unknown;
      };
    };

    const relevanceSignals: RelevanceSignals | undefined = parsed.signals
      ? {
          directAddress: parsed.signals.directAddress === true,
          topicExpertise: parsed.signals.topicExpertise === true,
          silenceBreaker: parsed.signals.silenceBreaker === true,
          followUp: parsed.signals.followUp === true,
        }
      : undefined;

    return {
      shouldRespond: parsed.shouldRespond === true,
      reason: typeof parsed.reason === "string" ? parsed.reason : "unknown",
      relevanceSignals,
    };
  } catch {
    // If JSON parsing fails, look for keywords as a fallback
    const lower = cleaned.toLowerCase();
    if (lower.includes('"shouldrespond": true') || lower.includes('"shouldrespond":true')) {
      return { shouldRespond: true, reason: "parsed from partial response" };
    }
    return { shouldRespond: false, reason: "failed to parse gate response" };
  }
}

function isTextContentBlock(block: { type: string }): block is TextContent {
  return block.type === "text";
}

function loadGateKnowledgeMemory(params: {
  cfg: OpenClawConfig;
  channel: string;
  groupId: string;
  workspaceDir: string;
}): {
  text?: string;
  sources: string[];
  charsBySource: Record<string, number>;
  totalChars: number;
} {
  const policy = resolveChannelGroupPolicy({
    cfg: params.cfg,
    channel: params.channel as "whatsapp",
    groupId: params.groupId,
  });
  const knowledgeFiles = resolveGroupKnowledgeFiles({
    sharedKnowledgeFile: (policy.defaultConfig as { knowledgeFile?: string } | undefined)
      ?.knowledgeFile,
    groupKnowledgeFile: (policy.groupConfig as { knowledgeFile?: string } | undefined)
      ?.knowledgeFile,
  });
  const knowledge = loadGroupKnowledgeFiles(params.workspaceDir, knowledgeFiles, {
    maxChars: 5000,
  });
  const sources = knowledge.sources.map((source) => `${source.scope}:${source.file}`);

  return {
    text: knowledge.block,
    sources,
    charsBySource: knowledge.charsBySource,
    totalChars: knowledge.totalChars,
  };
}

/**
 * Replace raw WhatsApp LID/JID @-mentions in the message body with resolved
 * human-readable names from the participant roster.
 *
 * E.g. `@194146111357056` → `@Jackie` when the roster maps that LID to
 * "Jackie". Unresolved @-mentions are left as-is.
 */
export function resolveMentionsInBody(
  body: string,
  mentionedJids: string[] | undefined,
  participantRoster: Map<string, string> | undefined,
): string {
  if (!mentionedJids?.length || !participantRoster?.size) {
    return body;
  }

  let resolved = body;
  for (const jid of mentionedJids) {
    // WhatsApp @-mentions appear in the body as the user-part of the JID
    // (the part before '@'), e.g. for JID "194146111357056:2@s.whatsapp.net"
    // or LID "194146111357056@lid" the body will contain "@194146111357056".
    const userPart = jid.split(/[:@]/)[0];
    if (!userPart) {
      continue;
    }

    // Look up name by full JID first, then by E164-normalised variants
    const name =
      participantRoster.get(jid) ??
      participantRoster.get(`+${userPart}`) ??
      Array.from(participantRoster.entries()).find(
        ([key]) => key.split(/[:@]/)[0] === userPart,
      )?.[1];

    if (name) {
      // Replace the @-mention in the body (there may be multiple for the same JID)
      resolved = resolved.replaceAll(`@${userPart}`, `@${name}`);
    }
  }
  return resolved;
}

/**
 * Run the two-phase LLM gate for an always-on group chat.
 *
 * Returns `{ shouldRespond: true }` (safe fallback) on any error or if the
 * gate is not configured. This ensures backward compatibility.
 */
/** @internal Exposed for unit testing only. */
export const _test = {
  readRecentSessionTranscript,
  buildGatePrompt,
  parseGateResponse,
  resolveMentionsInBody,
};

/**
 * Shared gate model call logic used by both the legacy and GateContext paths.
 * Builds the prompt, resolves the model, calls the LLM, and parses the result.
 */
async function callGateModel(params: {
  cfg: OpenClawConfig;
  transcript: string[];
  senderName: string;
  messageBody: string;
  gateKnowledgeText: string | undefined;
  gateKnowledgeMeta?: {
    sources: string[];
    charsBySource: Record<string, number>;
    totalChars: number;
  };
}): Promise<GroupGateResult> {
  const { cfg, transcript, senderName, messageBody, gateKnowledgeText } = params;
  const gateConfig: GroupGateConfig = cfg.agents?.defaults?.groupGate;

  if (!gateConfig?.enabled) {
    return { shouldRespond: true, reason: "gate not enabled" };
  }

  const timeoutMs = gateConfig.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const modelString = gateConfig.model ?? DEFAULT_GATE_MODEL;

  // Build the gate prompt
  const prompt = buildGatePrompt(transcript, senderName, messageBody, gateKnowledgeText);
  if (params.gateKnowledgeMeta) {
    const charsBySource = Object.entries(params.gateKnowledgeMeta.charsBySource).map(
      ([file, chars]) => `${file}:${chars}`,
    );
    log.debug(
      `Gate knowledge: sources=[${params.gateKnowledgeMeta.sources.join(", ") || "none"}], charsBySource={${charsBySource.join(", ") || "none"}}, totalChars=${params.gateKnowledgeMeta.totalChars}`,
    );
  }
  log.trace(`Gate prompt:\n${prompt}`);

  // Resolve the gate model
  const parsed = parseModelRef(modelString, DEFAULT_PROVIDER);
  if (!parsed) {
    log.warn(`Invalid gate model ref: ${modelString}; falling back to respond`);
    return { shouldRespond: true, reason: "invalid gate model ref" };
  }

  const resolved = resolveModel(parsed.provider, parsed.model, undefined, cfg);
  if (!resolved.model) {
    log.warn(`Gate model not found: ${modelString}; falling back to respond`);
    return { shouldRespond: true, reason: "gate model not found" };
  }

  const apiKey = requireApiKey(
    await getApiKeyForModel({ model: resolved.model, cfg }),
    parsed.provider,
  );

  // Call the gate model with a timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await completeSimple(
      resolved.model,
      {
        messages: [
          {
            role: "user" as const,
            content: prompt,
            timestamp: Date.now(),
          },
        ],
      },
      {
        apiKey,
        maxTokens: 250,
        temperature: 0.1,
        signal: controller.signal,
      },
    );

    const text = res.content
      .filter(isTextContentBlock)
      .map((block) => block.text.trim())
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!text) {
      log.warn("Gate model returned empty response; falling back to respond");
      return { shouldRespond: true, reason: "empty gate response" };
    }

    const result = parseGateResponse(text);
    log.debug(
      `Gate decision: shouldRespond=${result.shouldRespond}, reason="${result.reason}", signals=${result.relevanceSignals ? JSON.stringify(result.relevanceSignals) : "none"}`,
    );
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Run the relevance gate using pre-resolved GateContext.
 * Eliminates duplicate context loading — transcript, knowledge, and mentions
 * are already resolved in the GateContext.
 */
async function runGroupGateWithContext(
  ctx: GateContext,
  cfg: OpenClawConfig,
): Promise<GroupGateResult> {
  // Use pre-resolved context (zero re-loading)
  const messageBody = resolveMentionsInBody(
    ctx.rawMessage,
    [...ctx.resolvedMentions.keys()],
    ctx.resolvedMentions,
  );

  try {
    return await callGateModel({
      cfg,
      transcript: ctx.conversationHistory,
      senderName: ctx.senderName,
      messageBody,
      gateKnowledgeText: ctx.groupKnowledge,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Gate call failed (ctx path): ${message}; falling back to respond`);
    return { shouldRespond: true, reason: `gate error: ${message}` };
  }
}

// ── Overloaded runGroupGate ────────────────────────────────────────────

/** Legacy params shape (backward compatibility). */
type LegacyGateParams = {
  cfg: OpenClawConfig;
  agentId: string;
  sessionKey: string;
  senderName: string;
  messageBody: string;
  mentionedJids?: string[];
  participantRoster?: Map<string, string>;
  channel?: string;
  groupId?: string;
};

/** New GateContext-based params shape. */
type ContextGateParams = {
  ctx: GateContext;
  cfg: OpenClawConfig;
};

/**
 * Run the two-phase LLM gate for an always-on group chat.
 *
 * Supports two calling conventions:
 * - **New path**: `{ ctx: GateContext, cfg }` — uses pre-resolved context
 * - **Legacy path**: raw params — loads context internally (existing behavior)
 *
 * Returns `{ shouldRespond: true }` (safe fallback) on any error or if the
 * gate is not configured.
 */
export async function runGroupGate(
  params: LegacyGateParams | ContextGateParams,
): Promise<GroupGateResult> {
  // Dispatch: GateContext path vs legacy path
  if ("ctx" in params) {
    return runGroupGateWithContext(params.ctx, params.cfg);
  }

  // Legacy path: loads context internally (existing behavior)
  const { cfg, agentId, sessionKey, senderName } = params;
  const channel = params.channel?.trim().toLowerCase() ?? "whatsapp";
  const groupId = params.groupId?.trim();

  // Resolve raw @-mention LIDs to human-readable names before the gate sees them
  const messageBody = resolveMentionsInBody(
    params.messageBody,
    params.mentionedJids,
    params.participantRoster,
  );

  const gateConfig: GroupGateConfig = cfg.agents?.defaults?.groupGate;

  // Skip if gate is not enabled
  if (!gateConfig?.enabled) {
    return { shouldRespond: true, reason: "gate not enabled" };
  }

  const historyLimit = gateConfig.historyLimit ?? DEFAULT_HISTORY_LIMIT;

  try {
    // Resolve the session transcript file
    let transcript: string[] = [];
    try {
      const storePath = resolveStorePath(cfg.session?.store, { agentId });
      const store = loadSessionStore(storePath);
      const entry = store[sessionKey];
      const sessionId = entry?.sessionId ?? sessionKey;
      const sessionFilePath = resolveSessionFilePath(
        sessionId,
        entry,
        resolveSessionFilePathOptions({ agentId, storePath }),
      );
      transcript = readRecentSessionTranscript(sessionFilePath, historyLimit);
      log.debug(
        `Gate inputs: sessionFile=${sessionFilePath}, historyLimit=${historyLimit}, transcriptMessages=${transcript.length}, channel=${channel}, groupId=${groupId ?? "unknown"}`,
      );
    } catch (sessionErr) {
      const sessionMsg = sessionErr instanceof Error ? sessionErr.message : String(sessionErr);
      log.warn(`Gate session load failed (continuing without history): ${sessionMsg}`);
    }

    const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
    const gateKnowledge =
      groupId && channel === "whatsapp"
        ? loadGateKnowledgeMemory({
            cfg,
            channel,
            groupId,
            workspaceDir,
          })
        : { text: undefined, sources: [], charsBySource: {}, totalChars: 0 };

    return await callGateModel({
      cfg,
      transcript,
      senderName,
      messageBody,
      gateKnowledgeText: gateKnowledge.text,
      gateKnowledgeMeta: {
        sources: gateKnowledge.sources,
        charsBySource: gateKnowledge.charsBySource,
        totalChars: gateKnowledge.totalChars,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Gate call failed: ${message}; falling back to respond`);
    return { shouldRespond: true, reason: `gate error: ${message}` };
  }
}
