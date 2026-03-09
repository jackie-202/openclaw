/**
 * Shared GateContext layer for the group chat pipeline.
 *
 * Context resolution (knowledge loading, mention resolution, session transcript,
 * member roster) currently happens independently in `runGroupGate()` and
 * `processMessage()`. This module unifies that work into a single object
 * resolved once per inbound group message and consumed by all pipeline stages.
 */

import { resolveAgentWorkspaceDir } from "../../agents/agent-scope.js";
import type { OpenClawConfig } from "../../config/config.js";
import { resolveChannelGroupPolicy } from "../../config/group-policy.js";
import {
  loadSessionStore,
  resolveSessionFilePath,
  resolveSessionFilePathOptions,
  resolveStorePath,
} from "../../config/sessions.js";
import { createSubsystemLogger } from "../../logging/subsystem.js";
import { loadGroupKnowledgeFiles, resolveGroupKnowledgeFiles } from "./group-context-priming.js";
import { readRecentSessionTranscript, resolveMentionsInBody } from "./group-gate.js";

const log = createSubsystemLogger("gate-context");

const DEFAULT_HISTORY_LIMIT = 20;
const DEFAULT_KNOWLEDGE_MAX_CHARS = 5000;

// ── Types ──────────────────────────────────────────────────────────────

/**
 * A group member entry with display name and identifiers.
 * Assembled from the participant roster and raw groupParticipants list.
 */
export type GroupMember = {
  /** WhatsApp JID or LID (e.g. "194146111357056:2@s.whatsapp.net"). */
  jid?: string;
  /** E.164 phone number (e.g. "+420123456789"). */
  e164?: string;
  /** Human-readable display name. */
  name: string;
};

/**
 * Activation mode for the group.
 * - "always": every message triggers the pipeline (no mention required)
 * - "mention": only @-mentioned or reply-to-self messages trigger
 */
export type GroupActivation = "always" | "mention";

/**
 * Shared context object passed through the entire group gate pipeline.
 *
 * Resolved once at pipeline entry by `resolveGateContext()` and consumed by:
 *   - Security Gate (inbound classifier + outbound scanner)
 *   - Relevance Gate (shouldRespond decision)
 *   - Future: Data/Context Gate, Voice Gate, Delivery Gate
 *
 * Immutable after creation -- gates read but never mutate this object.
 */
export type GateContext = {
  /** WhatsApp group JID (e.g. "420123456789@g.us"). */
  groupId: string;

  /** Session key for this group conversation (from routing). */
  sessionKey: string;

  /** Agent ID handling this group. */
  agentId: string;

  /** The raw inbound message body (before mention resolution). */
  rawMessage: string;

  /**
   * Map of WhatsApp LID/JID to display name for @-mentions in this message.
   * Built from `mentionedJids` + participant roster.
   */
  resolvedMentions: Map<string, string>;

  /**
   * Loaded group knowledge content (merged shared + group-specific).
   * Content from `knowledge/groups/<group>.md` files, truncated to budget.
   * Undefined when no knowledge files are configured or all fail to load.
   */
  groupKnowledge: string | undefined;

  /**
   * Recent conversation history as formatted transcript lines.
   * Last N messages from the session JSONL (default 20).
   * Each entry is "User: ..." or "Assistant: ...".
   */
  conversationHistory: string[];

  /** Known group members assembled from roster + participants. */
  groupMembers: GroupMember[];

  /** Display name of the message sender. */
  senderName: string;

  /** Group activation mode (resolved from config + session store). */
  activation: GroupActivation;
};

/**
 * Parameters needed to resolve a full GateContext.
 * Assembled from the inbound message and routing layer in on-message.ts.
 */
export type GateContextParams = {
  cfg: OpenClawConfig;
  agentId: string;
  sessionKey: string;
  groupId: string;
  channel: string;
  accountId?: string;

  /** Raw message body from inbound WhatsApp message. */
  rawMessage: string;
  senderName: string;
  senderE164?: string;
  senderJid?: string;
  activation: GroupActivation;

  /** Raw mentionedJids from the WhatsApp inbound message. */
  mentionedJids?: string[];

  /**
   * Group participant roster: JID -> display name.
   * Comes from `groupMemberNames` map in the monitor.
   */
  participantRoster?: Map<string, string>;

  /**
   * Raw participant list from the inbound message (msg.groupParticipants).
   * Used to supplement roster for GroupMember assembly.
   */
  rawParticipants?: string[];
};

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Build the resolvedMentions map from mentionedJids + participant roster.
 * Looks up each JID's user-part in the roster to find a human name.
 */
function buildResolvedMentions(
  mentionedJids: string[] | undefined,
  participantRoster: Map<string, string> | undefined,
): Map<string, string> {
  const resolved = new Map<string, string>();
  if (!mentionedJids?.length || !participantRoster?.size) {
    return resolved;
  }

  for (const jid of mentionedJids) {
    const userPart = jid.split(/[:@]/)[0];
    if (!userPart) {
      continue;
    }

    // Same lookup logic as resolveMentionsInBody: full JID, +userPart, or userPart match
    const name =
      participantRoster.get(jid) ??
      participantRoster.get(`+${userPart}`) ??
      Array.from(participantRoster.entries()).find(
        ([key]) => key.split(/[:@]/)[0] === userPart,
      )?.[1];

    if (name) {
      resolved.set(jid, name);
    }
  }

  return resolved;
}

/**
 * Try to extract an E.164 phone number from a WhatsApp JID.
 * Returns undefined if the JID doesn't look like a phone-based JID.
 */
function extractE164FromJid(jid: string): string | undefined {
  // LID/device-scoped IDs include a colon suffix before '@' (e.g. "123:2@...")
  // and are not stable phone identifiers.
  if (jid.includes(":")) {
    return undefined;
  }

  const userPart = jid.split(/[:@]/)[0];
  if (!userPart) {
    return undefined;
  }
  // Phone-based JIDs have all-digit user-parts
  if (/^\d+$/.test(userPart)) {
    return `+${userPart}`;
  }
  return undefined;
}

/**
 * Assemble GroupMember[] from roster and raw participant lists.
 */
function assembleGroupMembers(
  participantRoster: Map<string, string> | undefined,
  rawParticipants: string[] | undefined,
): GroupMember[] {
  const members: GroupMember[] = [];
  const seenJids = new Set<string>();

  // From participant roster (has names)
  if (participantRoster?.size) {
    for (const [jid, name] of participantRoster) {
      seenJids.add(jid);
      members.push({ jid, name, e164: extractE164FromJid(jid) });
    }
  }

  // From raw participants not already in roster (name-less, use JID as fallback)
  if (rawParticipants?.length) {
    for (const jid of rawParticipants) {
      if (!seenJids.has(jid)) {
        seenJids.add(jid);
        members.push({ jid, name: jid, e164: extractE164FromJid(jid) });
      }
    }
  }

  return members;
}

/**
 * Load group knowledge files via the existing priming pipeline.
 * Returns the formatted block text, or undefined if no files matched.
 */
function loadGateKnowledge(params: {
  cfg: OpenClawConfig;
  channel: string;
  groupId: string;
  workspaceDir: string;
}): string | undefined {
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
    maxChars: DEFAULT_KNOWLEDGE_MAX_CHARS,
  });

  const sources = knowledge.sources.map((s) => `${s.scope}:${s.file}`);
  log.debug(
    `Knowledge loaded: sources=[${sources.join(", ") || "none"}], totalChars=${knowledge.totalChars}`,
  );

  return knowledge.block;
}

// ── Main resolver ──────────────────────────────────────────────────────

/**
 * Resolve a complete GateContext from inbound message parameters.
 *
 * Consolidates four context-loading paths currently scattered across files:
 *
 * 1. **Mention resolution** -- from `group-gate.ts` `resolveMentionsInBody()`
 * 2. **Knowledge loading** -- from `group-context-priming.ts`
 * 3. **History loading** -- from `group-gate.ts` `readRecentSessionTranscript()`
 * 4. **Member roster lookup** -- from `group-members.ts` roster + participants
 *
 * This function performs synchronous file I/O only (no network calls).
 * It is called once per inbound group message, before any gate runs.
 */
export function resolveGateContext(params: GateContextParams): GateContext {
  const channel = params.channel?.trim().toLowerCase() ?? "whatsapp";

  // 1. Resolve @-mentions
  const resolvedMentions = buildResolvedMentions(params.mentionedJids, params.participantRoster);

  // 2. Load group knowledge
  const workspaceDir = resolveAgentWorkspaceDir(params.cfg, params.agentId);
  let groupKnowledge: string | undefined;
  if (params.groupId && channel === "whatsapp") {
    groupKnowledge = loadGateKnowledge({
      cfg: params.cfg,
      channel,
      groupId: params.groupId,
      workspaceDir,
    });
  }

  // 3. Load session transcript
  let conversationHistory: string[] = [];
  try {
    const storePath = resolveStorePath(params.cfg.session?.store, { agentId: params.agentId });
    const store = loadSessionStore(storePath);
    const entry = store[params.sessionKey];
    const sessionId = entry?.sessionId ?? params.sessionKey;
    const sessionFilePath = resolveSessionFilePath(
      sessionId,
      entry,
      resolveSessionFilePathOptions({ agentId: params.agentId, storePath }),
    );
    conversationHistory = readRecentSessionTranscript(sessionFilePath, DEFAULT_HISTORY_LIMIT);
    log.debug(
      `History loaded: sessionKey=${params.sessionKey}, messages=${conversationHistory.length}`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`Session load failed (continuing without history): ${msg}`);
  }

  // 4. Assemble group members
  const groupMembers = assembleGroupMembers(params.participantRoster, params.rawParticipants);

  return {
    groupId: params.groupId,
    sessionKey: params.sessionKey,
    agentId: params.agentId,
    rawMessage: params.rawMessage,
    resolvedMentions,
    groupKnowledge,
    conversationHistory,
    groupMembers,
    senderName: params.senderName,
    activation: params.activation,
  };
}

/** @internal Exposed for unit testing only. */
export const _test = {
  buildResolvedMentions,
  extractE164FromJid,
  assembleGroupMembers,
  loadGateKnowledge,
};
