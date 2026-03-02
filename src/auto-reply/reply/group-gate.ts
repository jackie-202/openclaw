/**
 * Two-phase LLM gate for always-on group chats.
 *
 * Phase 1 (this file): a cheap/fast model call reads the conversation history
 * plus the new inbound message and decides whether the assistant should respond.
 * Only if the gate says "yes" does the normal Phase 2 (full LLM run) proceed.
 */

import fs from "node:fs";
import { completeSimple, type TextContent } from "@mariozechner/pi-ai";
import { DEFAULT_PROVIDER } from "../../agents/defaults.js";
import { getApiKeyForModel, requireApiKey } from "../../agents/model-auth.js";
import { parseModelRef } from "../../agents/model-selection.js";
import { resolveModel } from "../../agents/pi-embedded-runner/model.js";
import type { OpenClawConfig } from "../../config/config.js";
import {
  loadSessionStore,
  resolveSessionFilePath,
  resolveSessionFilePathOptions,
  resolveStorePath,
} from "../../config/sessions.js";
import { createSubsystemLogger } from "../../logging/subsystem.js";

const log = createSubsystemLogger("group-gate");

const DEFAULT_HISTORY_LIMIT = 20;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_GATE_MODEL = "copilot/gpt-4o-mini";

export type GroupGateResult = {
  shouldRespond: boolean;
  reason: string;
};

type GroupGateConfig = NonNullable<NonNullable<OpenClawConfig["agents"]>["defaults"]>["groupGate"];

/**
 * Read the last N user/assistant messages from a session JSONL file and format
 * them as a readable transcript (sender: message).
 */
function readRecentSessionTranscript(sessionFilePath: string, limit: number): string[] {
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
function buildGatePrompt(transcript: string[], newSender: string, newMessage: string): string {
  const historyBlock =
    transcript.length > 0 ? transcript.join("\n") : "(No prior conversation history)";

  return `You are a group chat response gate. Decide whether the AI assistant ("Jackie") should respond to the latest message.

## Conversation History (last ${transcript.length} messages):
${historyBlock}

## New Message:
${newSender}: ${newMessage}

## ALWAYS respond YES if:
- The message contains @mention of the assistant (any @ tag referencing Jackie or the assistant's ID) — this is a DIRECT summon, always respond
- The message directly addresses Jackie by name ("Jackie, ...", "hej Jackie", etc.)
- Someone asks Jackie a question or gives Jackie a command/request ("Jackie potvrd", "Jackie co si myslíš", etc.)
- Someone is replying to something Jackie said, asking a follow-up question

## Respond YES if:
- The assistant has genuinely new, useful information to add that nobody else covered
- Someone asks a factual question that Jackie can answer and nobody else has answered yet

## Respond NO if:
- The assistant already answered this exact question/topic recently (check history)
- The message is just an emoji, reaction, or short acknowledgment (ok, jo, jojo, :D, 🫡, etc.)
- It's casual banter between other people where Jackie has nothing meaningful to add
- The message is about Jackie but not directed TO Jackie (e.g. "Jackie musel..." or "ten bot je...")  — UNLESS it also contains an @mention or direct address
- Adding a response would just repeat what Jackie already said
- The message is a shared link with no question attached

## Critical distinction:
- "Jackie potvrd" or "@Jackie potvrd" = DIRECT COMMAND → YES
- "Jackie musel odbranchovat openclaw" = TALKING ABOUT Jackie → NO
- "je tu @Jackie" + a request = SUMMONING Jackie → YES
- "vidíš jak je těžký mlčet pro LLM?" = meta-commentary → NO

When in doubt, lean towards YES. It's better to respond once too many than to ignore a direct request.

## Response Format (JSON only, no other text):
{"shouldRespond": true/false, "reason": "brief explanation"}`;
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
    const parsed = JSON.parse(cleaned) as { shouldRespond?: unknown; reason?: unknown };
    return {
      shouldRespond: parsed.shouldRespond === true,
      reason: typeof parsed.reason === "string" ? parsed.reason : "unknown",
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
};

export async function runGroupGate(params: {
  cfg: OpenClawConfig;
  agentId: string;
  sessionKey: string;
  senderName: string;
  messageBody: string;
}): Promise<GroupGateResult> {
  const { cfg, agentId, sessionKey, senderName, messageBody } = params;

  const gateConfig: GroupGateConfig = cfg.agents?.defaults?.groupGate;

  // Skip if gate is not enabled
  if (!gateConfig?.enabled) {
    return { shouldRespond: true, reason: "gate not enabled" };
  }

  const historyLimit = gateConfig.historyLimit ?? DEFAULT_HISTORY_LIMIT;
  const timeoutMs = gateConfig.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const modelString = gateConfig.model ?? DEFAULT_GATE_MODEL;

  try {
    // Resolve the session transcript file
    const storePath = resolveStorePath(cfg.session?.store, { agentId });
    const store = loadSessionStore(storePath);
    const entry = store[sessionKey];
    const sessionId = entry?.sessionId ?? sessionKey;
    const sessionFilePath = resolveSessionFilePath(
      sessionId,
      entry,
      resolveSessionFilePathOptions({ agentId, storePath }),
    );

    // Read recent conversation history
    const transcript = readRecentSessionTranscript(sessionFilePath, historyLimit);

    // Build the gate prompt
    const prompt = buildGatePrompt(transcript, senderName, messageBody);

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
          maxTokens: 150,
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
      log.debug(`Gate decision: shouldRespond=${result.shouldRespond}, reason="${result.reason}"`);
      return result;
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Gate call failed: ${message}; falling back to respond`);
    return { shouldRespond: true, reason: `gate error: ${message}` };
  }
}
