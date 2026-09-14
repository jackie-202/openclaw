const APPROVAL_COMMAND_REGEX = /^\/?approve(?:\s|$)/i;
const FOREIGN_APPROVAL_COMMAND_MENTION_REGEX = /^\/approve@([^\s]+)(?:\s|$)/i;

type ApprovalCommandCandidate =
  | { kind: "command"; prefixLength: number }
  | { kind: "foreign-mention" };

/** Matches the exact approval command forms owned by the approval command handler. */
export function matchApprovalCommandCandidate(raw: string): ApprovalCommandCandidate | null {
  const trimmed = raw.trim();
  if (FOREIGN_APPROVAL_COMMAND_MENTION_REGEX.test(trimmed)) {
    return { kind: "foreign-mention" };
  }
  const commandMatch = trimmed.match(APPROVAL_COMMAND_REGEX);
  return commandMatch ? { kind: "command", prefixLength: commandMatch[0].length } : null;
}

/** Identifies approval commands that must reach their control handler without waiting on a run. */
export function isApprovalCommandCandidate(raw: string): boolean {
  return matchApprovalCommandCandidate(raw) !== null;
}
