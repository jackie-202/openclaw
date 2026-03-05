/**
 * Group session context priming.
 *
 * When a group session resets (daily / idle), the new session starts blank.
 * This module injects two pieces of continuity context on the first turn:
 *
 * 1. **Group knowledge file** — curated knowledge from `knowledge/groups/`
 *    mapped via `knowledgeFile` in the per-group config.
 * 2. **Previous session tail** — the last N messages from the previous
 *    session JSONL so the model has conversational context across the reset.
 */

import fs from "node:fs";
import path from "node:path";
import { createSubsystemLogger } from "../../logging/subsystem.js";

const log = createSubsystemLogger("group-priming");

const MAX_KNOWLEDGE_CHARS = 6000;
const DEFAULT_TAIL_MESSAGES = 15;
const MAX_TAIL_CHARS = 3000;

type GroupKnowledgeScope = "shared" | "group";

export type GroupKnowledgeSource = {
  scope: GroupKnowledgeScope;
  file: string;
};

export type LoadedGroupKnowledge = {
  block?: string;
  totalChars: number;
  charsBySource: Record<string, number>;
  sources: GroupKnowledgeSource[];
};

function resolveKnowledgeSectionTitle(scope: GroupKnowledgeScope): string {
  return scope === "shared" ? "Shared Group Knowledge" : "Group Knowledge (specific)";
}

function isPathWithinWorkspace(workspaceDir: string, filePath: string): boolean {
  const workspaceRoot = path.resolve(workspaceDir);
  const relative = path.relative(workspaceRoot, filePath);
  return relative.length > 0 && !relative.startsWith("..") && !path.isAbsolute(relative);
}

export function resolveGroupKnowledgeFiles(params: {
  sharedKnowledgeFile?: string;
  groupKnowledgeFile?: string;
}): GroupKnowledgeSource[] {
  const ordered: GroupKnowledgeSource[] = [];
  const seen = new Set<string>();
  const candidates: GroupKnowledgeSource[] = [
    { scope: "shared", file: params.sharedKnowledgeFile?.trim() ?? "" },
    { scope: "group", file: params.groupKnowledgeFile?.trim() ?? "" },
  ];

  for (const candidate of candidates) {
    if (!candidate.file) {
      continue;
    }
    if (seen.has(candidate.file)) {
      continue;
    }
    seen.add(candidate.file);
    ordered.push(candidate);
  }

  return ordered;
}

export function loadGroupKnowledgeFiles(
  workspaceDir: string,
  files: GroupKnowledgeSource[],
  options?: {
    maxChars?: number;
  },
): LoadedGroupKnowledge {
  const maxChars = options?.maxChars ?? MAX_KNOWLEDGE_CHARS;
  const sections: string[] = [];
  const charsBySource: Record<string, number> = {};
  const sources: GroupKnowledgeSource[] = [];
  let totalChars = 0;
  let truncated = false;

  for (const file of files) {
    if (!file.file.trim()) {
      continue;
    }

    const filePath = path.resolve(workspaceDir, file.file);
    if (!isPathWithinWorkspace(workspaceDir, filePath)) {
      log.warn(`Group knowledge file path escapes workspace: ${file.file}`);
      continue;
    }

    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf-8").trim();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn(`Failed to load group knowledge file ${file.file}: ${message}`);
      continue;
    }

    if (!content) {
      continue;
    }

    const remaining = maxChars - totalChars;
    if (remaining <= 0) {
      truncated = true;
      break;
    }

    if (content.length > remaining) {
      content = content.slice(0, remaining);
      truncated = true;
    }

    const chars = content.length;
    totalChars += chars;
    charsBySource[file.file] = chars;
    sources.push(file);
    sections.push(`## ${resolveKnowledgeSectionTitle(file.scope)}\n\n${content}`);
  }

  if (sections.length === 0) {
    return {
      totalChars,
      charsBySource,
      sources,
    };
  }

  const block = `${sections.join("\n\n")}${truncated ? "\n\n[truncated]" : ""}`;
  log.debug(`Loaded group knowledge: sources=${sources.length}, chars=${totalChars}`);
  return {
    block,
    totalChars,
    charsBySource,
    sources,
  };
}

/**
 * Load the group knowledge file content from workspace.
 *
 * @param workspaceDir  Agent workspace directory
 * @param knowledgeFile Relative path from workspace (e.g. "knowledge/groups/foo.md")
 * @returns Formatted knowledge block or undefined
 */
export function loadGroupKnowledgeFile(
  workspaceDir: string,
  knowledgeFile: string | undefined,
): string | undefined {
  const files = resolveGroupKnowledgeFiles({ groupKnowledgeFile: knowledgeFile });
  return loadGroupKnowledgeFiles(workspaceDir, files).block;
}

/**
 * Read the last N user/assistant messages from a session JSONL file.
 */
function readTailMessages(sessionFilePath: string, limit: number): string[] {
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
              const label = role === "assistant" ? "Jackie" : "User";
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
 * Find the most recent reset-backup for a session file.
 *
 * OpenClaw keeps the same session ID for groups across resets; the old
 * transcript is renamed to `<sessionId>.jsonl.reset.<timestamp>.bak`.
 * We pick the newest `.reset.*.bak` sibling of the current session file.
 *
 * As a fallback (different session ID), we also look for the most recent
 * `.jsonl` file that is not the current one.
 */
function findPreviousSessionFile(currentSessionFile: string): string | undefined {
  try {
    const dir = path.dirname(currentSessionFile);
    const base = path.basename(currentSessionFile); // e.g. "8056d5e6-....jsonl"
    const files = fs.readdirSync(dir);

    // Strategy 1: reset backups of the same session ID
    const resetPrefix = `${base}.reset.`;
    const resetCandidates = files
      .filter((name) => name.startsWith(resetPrefix))
      .toSorted()
      .toReversed();

    if (resetCandidates.length > 0) {
      return path.join(dir, resetCandidates[0]);
    }

    // Strategy 2: any other .jsonl (not .reset., not .deleted., not current)
    const otherCandidates = files
      .filter(
        (name) =>
          name.endsWith(".jsonl") &&
          !name.includes(".reset.") &&
          !name.includes(".deleted.") &&
          name !== base,
      )
      .toSorted()
      .toReversed();

    if (otherCandidates.length > 0) {
      return path.join(dir, otherCandidates[0]);
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Load the tail of the previous group session as conversational context.
 *
 * @param currentSessionFile Path to the current (new) session file
 * @param messageCount       Number of messages to include
 * @returns Formatted tail block or undefined
 */
export function loadPreviousSessionTail(
  currentSessionFile: string | undefined,
  messageCount: number = DEFAULT_TAIL_MESSAGES,
): string | undefined {
  if (!currentSessionFile) {
    return undefined;
  }

  const prevFile = findPreviousSessionFile(currentSessionFile);
  if (!prevFile) {
    log.debug("No previous session file found for tail injection");
    return undefined;
  }

  const messages = readTailMessages(prevFile, messageCount);
  if (messages.length === 0) {
    return undefined;
  }

  let transcript = messages.join("\n");
  if (transcript.length > MAX_TAIL_CHARS) {
    // Trim from the start to keep the most recent messages
    transcript = transcript.slice(-MAX_TAIL_CHARS);
    const firstNewline = transcript.indexOf("\n");
    if (firstNewline > 0) {
      transcript = "[...]\n" + transcript.slice(firstNewline + 1);
    }
  }

  log.debug(
    `Loaded previous session tail: ${messages.length} messages from ${path.basename(prevFile)}`,
  );
  return `## Recent conversation (end of previous session, for continuity)\n\n${transcript}`;
}
