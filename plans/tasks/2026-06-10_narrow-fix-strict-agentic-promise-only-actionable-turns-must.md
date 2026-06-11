# Narrow fix: strict-agentic promise-only actionable turns must retry instead of finalizing

## Context

Two completed investigations (`quick-wave-8890`, `quick-cove-4103`) found that:

- The global OpenClaw prompt already says actionable requests should act in the current turn and should not end with a plan/promise when tools can move work forward.
- The embedded runner already has deterministic incomplete-turn / planning-only / reasoning-only retry handling.
- The lowest-risk global behavior fix is not Discord-specific and not a prompt-only change. It should extend the shared embedded-runner incomplete-turn policy so normal OpenClaw agent turns behave more like the previous proactive behavior.

Relevant files:

- `src/agents/embedded-agent-runner/run/incomplete-turn.ts`
- `src/agents/embedded-agent-runner/run.incomplete-turn.test.ts`
- Touch `src/agents/embedded-agent-runner/run.ts` only if absolutely necessary for wiring; prefer no `run.ts` change.

## Goal

Extend strict-agentic embedded runner detection so an actionable final assistant message that only promises/proposes the next action, with no actual progress/evidence, is treated like a planning-only incomplete turn and retried through the existing planning-only retry flow.

This is a minimal behavior correction, not a broad architecture rewrite.

## Requirements

1. Reuse the existing planning-only retry mechanism/instruction path. Do not create a new retry subsystem.
2. Keep the production change narrow, ideally only in `src/agents/embedded-agent-runner/run/incomplete-turn.ts`.
3. Detect promise-only / actionable-no-progress terminal assistant text such as:
   - `I'll check ...`
   - `I'll look into ...`
   - `I can do that ...`
   - `Next I'll ...`
   - `Let me check ...`
   - `We should update ...`
   - `I would run/check/update ...`
   - similar text that clearly proposes or promises an obvious tool-backed next action instead of doing it.
4. Only classify as incomplete when replay is safe and the attempt has no actual progress/evidence:
   - no client tool calls
   - no successful messaging delivery evidence
   - no successful cron add
   - no accepted session spawn
   - no deterministic approval prompt
   - no last tool error
   - no side-effectful replay metadata
5. Preserve existing safety and chat behavior. Do **not** classify these as violations:
   - ordinary informational answers/explanations
   - summaries/findings/results that answer the user
   - explicit blocker statements
   - approval/confirmation requests for unsafe, destructive, external, or privacy-sensitive actions
   - `NO_REPLY` / silent reply behavior
   - turns after actual tool progress where the final message summarizes what happened
6. Scope to strict-agentic / supported GPT-5-family lanes consistently with the existing planning-only guard. Do not make every provider inherit this behavior accidentally.
7. Add focused tests in `src/agents/embedded-agent-runner/run.incomplete-turn.test.ts` proving:
   - strict-agentic GPT-5 promise-only actionable final text retries instead of finalizing
   - after retry exhaustion, the existing strict-agentic blocked path is used rather than a misleading promise final
   - ordinary informational answer text still finalizes normally
   - blocker/confirmation-style text still finalizes normally
   - attempts with actual tool progress/evidence are not retried as promise-only

## Non-goals

- Do not modify Discord-specific code.
- Do not modify Mission Control.
- Do not modify `packages/agent-core` loop behavior.
- Do not add `deliver` to `sessions.send`.
- Do not rewrite the global system prompt except for tests if needed.
- Do not broaden this into a full agentic classifier framework.

## Verification

Run focused tests at minimum:

```bash
pnpm test src/agents/embedded-agent-runner/run.incomplete-turn.test.ts -- --reporter=verbose
```

Also run the smallest practical lint/type/build gate required by this repo for the touched files. Record exact commands and outcomes.
