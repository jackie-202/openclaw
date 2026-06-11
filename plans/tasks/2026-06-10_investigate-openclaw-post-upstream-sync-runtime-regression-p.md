# Investigate OpenClaw post-upstream-sync runtime regression: promise-without-action and session delivery

## Context

After the 2026-06-09 upstream sync, Jackie behavior regressed in live Discord use:

- On actionable requests, the assistant sometimes replies with a promise/progress statement (for example “založím task”, “restartuju”, “udělám”) but stops before executing or verifying the action.
- This caused repeated user-visible friction on 2026-06-10.
- Mission Control Ask Jackie routing also exposed a related delivery seam: `sessions.send` can run the agent work, but the final confirmation may not be delivered back to `#tech-debt` unless semantics are configured/used correctly.

Michal asked to compare current OpenClaw against the backed-up pre-sync version and determine whether system prompt, harness/runtime, or configuration changes caused this.

Known branches:

- Current: `main` at/near `cfefa09329a3d446763b6f2ef55cce6b547182e9`
- Pre-sync backup: `backup/pre-clean-upstream-sync-post-wip-20260609-154137`
- Sync work branch: `sync/clean-upstream-20260609`

Important observation from host check:

- `packages/agent-core/src/agent-loop.ts` exists on current `main` but does **not** exist on `backup/pre-clean-upstream-sync-post-wip-20260609-154137`.
- Current sync introduced/changed prompt/runtime areas including:
  - `packages/agent-core/src/agent-loop.ts`
  - `packages/agent-core/src/harness/prompt-templates.ts`
  - `packages/agent-core/src/harness/system-prompt.ts`
  - root `AGENTS.md`

## Goal

Produce a concrete investigation report and, if the cause is clear and safe, a minimal fix with tests.

The primary behavioral invariant we want back:

> For actionable requests, the agent must not end the user-visible turn after a pure promise/progress statement when no action/tool evidence exists. It should continue with tools or clearly report a real blocker.

## Required investigation

1. Compare current `main` with `backup/pre-clean-upstream-sync-post-wip-20260609-154137` and `sync/clean-upstream-20260609`.
   - Use `git show <branch>:<path>` and `git diff` rather than checking out branches if possible.
   - Because `agent-loop.ts` is new on current, find the old equivalent runtime loop files on the backup branch with `git ls-tree -r backup/pre-clean-upstream-sync-post-wip-20260609-154137 | grep -Ei 'agent|loop|harness|prompt|session'`.

2. Inspect prompt/harness changes:
   - root `AGENTS.md`
   - `packages/agent-core/src/harness/system-prompt.ts`
   - `packages/agent-core/src/harness/prompt-templates.ts`
   - any code that assembles developer/system prompt from workspace AGENTS/SOUL/MEMORY.

3. Inspect agent-loop termination semantics:
   - `packages/agent-core/src/agent-loop.ts`
   - `shouldStopAfterTurn`
   - tool-call execution and `turn_end` behavior
   - whether the runtime treats a final assistant text with no tool call as successful completion even when the content is only a promise.

4. Inspect `sessions.send` semantics:
   - Gateway schema/handler for `sessions.send` / `sessions_send`.
   - `deliver?: boolean`, `timeoutMs`, `sessionKey`, final response shape.
   - Determine whether MC should set `deliver: true`, nonzero timeout, or whether OpenClaw should auto-deliver final responses for channel sessions.

## Desired fix shape

Prefer a minimal, testable fix. Options to evaluate:

A. Prompt-level guard:

- Reinforce the injected runtime/developer prompt: action requests require action+evidence before final response.
- Pros: low risk.
- Cons: model-dependent; may not catch all promise-only stops.

B. Harness/runtime guard:

- Detect promise-only final assistant output after actionable user request with no tool calls/evidence and force continuation or convert to a self-correction prompt.
- Pros: stronger.
- Cons: riskier; must avoid blocking legitimate answers.

C. Test-only + config/doc fix:

- If behavior is only from current session prompt/config, identify exact config/prompt change and update local workspace guardrails.

Do not implement a broad behavioral rewrite without tests.

## Tests to add or update

At minimum add/identify tests covering:

1. Action request + assistant says “I’ll create the task” with no tool call should not be considered a completed successful turn.
2. Action request + tool call + evidence can complete normally.
3. Non-actional advice/questions are not forced into tool calls.
4. `sessions.send` delivery semantics are documented by tests:
   - `timeoutMs: 0` behavior;
   - `deliver: true` / default deliver behavior for channel sessions;
   - response shape used by callers.

## Deliverable

Create an investigation note under `plans/investigations/` or `knowledge/` with:

- exact old/new files and commits compared;
- likely root cause;
- whether a code fix was applied;
- test evidence;
- any follow-up tasks needed.

If applying a fix, keep it narrow and include test evidence in the final task summary.

## Constraints

- No Git operations like commit/push/branch/PR in the task output.
- Do not mutate OpenClaw live config unless explicitly necessary for local verification; if config change is needed, document it instead.
- Preserve user safety/approval semantics.
