---
tdd:
  decision: required
  reason: Status thinking output is observable behavior; precedence and target-session routing require regression characterization.
---

# Plan

## Analysis

- `get-reply-directives.ts` resolves session thinking before channel-profile thinking; `session-status-tool.ts` currently supplies only session thinking to status rendering.
- Reuse channel-profile resolution from `src/channels/model-overrides.ts`; keep session override (including `off`) ahead of profile thinking and existing defaults.
- Resolve using the target session's channel identity and matching semantics, never the caller's channel for another target.

## Approach

- Pass target-specific effective thinking through the existing status input without changing formatting/default policy or the model parameter API.
- Keep the status read-only and limit changes to resolver integration and focused regression coverage.

## Implementation

1. Add regression cases for inherited `xhigh`, explicit session override and `off`, no channel match, different target-session channel, and unchanged persisted session/model state.
2. Run the focused characterization against current behavior and record RED.
3. Integrate the existing channel-profile resolver for the target session, preserving session override and downstream fallback; rerun focused tests for GREEN.
4. Inspect the diff for unintended writes or unrelated behavior.

## Testing

- Run `pnpm test:fast src/agents/openclaw-tools.session-status.test.ts src/auto-reply/reply/commands-status.thinking-default.test.ts` and verify the listed cases.
- Retain independent acceptance and the registered project gates as separate required verification owned by their gate runners; do not substitute the focused tests for either gate.

## TDD

- Characterize the failing status output in `src/agents/openclaw-tools.session-status.test.ts` before implementation; capture RED and GREEN evidence per `skill:tdd`.

## Files

- `src/agents/tools/session-status-tool.ts` — resolve target-session channel thinking and pass it to status rendering.
- `src/agents/openclaw-tools.session-status.test.ts` — verify precedence, target routing, and read-only behavior.
- `src/auto-reply/reply/commands-status.thinking-default.test.ts` — update only if needed to protect unchanged fallback behavior.

## Progress

- [x] Read rejected plan and incorporate review feedback requiring independent acceptance and registered project gates.
- [x] Keep TDD required for the behavior regression.
