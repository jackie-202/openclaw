# Plan 2026-06-10: Investigate OpenClaw Runtime Regression

Diagnostic investigation plan for the post-sync promise-without-action turn completion and `sessions.send` delivery seam.

## Problem

Current runtime may treat promise-only assistant text as a successful actionable turn when no tool/action evidence exists; Mission Control may also call `sessions.send` with semantics that run work but do not deliver final confirmation to the originating channel.

## Analysis

### Codebase Context

- Compare branches without checkout: `git diff`, `git show <branch>:<path>`, and `git ls-tree -r backup/pre-clean-upstream-sync-post-wip-20260609-154137 | grep -Ei 'agent|loop|harness|prompt|session'`.
- Current-only agent-core surface to inspect first: `packages/agent-core/src/agent-loop.ts`, `packages/agent-core/src/agent-loop.test.ts`, `packages/agent-core/src/harness/system-prompt.ts`, `packages/agent-core/src/harness/prompt-templates.ts`.
- Current loop stop seam: `packages/agent-core/src/agent-loop.ts:272` outer loop, `packages/agent-core/src/agent-loop.ts:311` tool call detection, `packages/agent-core/src/agent-loop.ts:355` `shouldStopAfterTurn`, `packages/agent-core/src/agent-loop.ts:382` normal `agent_end` after no more work.
- Prompt assembly surfaces to trace: root `AGENTS.md`, `src/gateway/agent-prompt.ts`, `src/gateway/gateway-config-prompts.shared.ts`, `src/gateway/openresponses-prompt.ts`, `packages/agent-core/src/harness/*`.
- `sessions.send` surfaces to trace: `packages/gateway-protocol/src/schema/sessions.ts:163`, `packages/gateway-protocol/src/schema/logs-chat.ts:77`, `src/gateway/server-methods/sessions.ts`, `src/gateway/server.sessions-send.test.ts`, `src/agents/tools/sessions-send-tool.a2a.ts`.
- Scoped gateway rules apply: `src/gateway/AGENTS.md` and `src/gateway/server-methods/AGENTS.md`; do not write raw transcript JSONL in gateway fixes.

### Relevant Documentation

- No docs edits planned during investigation.
- If behavior/API changes are recommended, later implementation must update user-visible plugin/session docs using the docs workflow.

### Knowledge Base

- Upstream-sync debugging lesson: verify exact runtime surface, not only source intent; compare live/runtime import and behavior paths before blaming config.
- Runtime debugging lesson: prove linked/source runtime identity when reproducing CLI or gateway behavior.
- Verification rule: use focused runtime tests plus build only if lazy/module boundaries or published package surfaces change.

## Available Skills

- `compound-plan`: already used for this plan.
- `openclaw-debugging`: use during investigation if live model/provider/tool/runtime logs are needed.
- `openclaw-testing`: use before choosing local vs Crabbox/Testbox proof.
- `tdd`: use only if the investigation proceeds to a code fix.
- `autoreview`: use after any implementation, before handoff.
- `save-learning`: mandatory after completing the investigation/fix task.

## Solutions

- Diagnostic first: reproduce the promise-only stop and delivery behavior before changing prompts or runtime.
- Prefer prompt-level fix only if diffs show the sync weakened or removed a concrete action-evidence instruction and no runtime regression exists.
- Prefer runtime/harness guard only if tests prove the loop now lacks an invariant that pre-sync behavior enforced elsewhere.
- Prefer config/doc/caller fix only if `sessions.send` semantics already require `deliver: true` or nonzero `timeoutMs` and Mission Control is using the wrong contract.

## Implementation

### Reproduce

1. Record current commit with `git rev-parse HEAD` and branch refs with `git rev-parse backup/pre-clean-upstream-sync-post-wip-20260609-154137 sync/clean-upstream-20260609`.
2. Create a minimal local reproduction for `agentLoop` where an actionable user prompt receives assistant text like `I'll create the task` with no tool calls.
3. Capture current event order: `agent_start`, `turn_start`, assistant `message_end`, `turn_end`, `agent_end`; note whether `shouldStopAfterTurn` sees empty `toolResults`.
4. Reproduce `sessions.send` using existing gateway test harness with `timeoutMs: 0`, omitted timeout, and channel-backed delivery context.

### Trace

1. Diff prompt/runtime files from backup to current: root `AGENTS.md`, `packages/agent-core/src/agent-loop.ts`, `packages/agent-core/src/harness/system-prompt.ts`, `packages/agent-core/src/harness/prompt-templates.ts`, old equivalent files discovered by `git ls-tree`.
2. Diff sync branch to current for the same files to separate upstream changes from local follow-up changes.
3. Trace prompt assembly from workspace AGENTS/SOUL/MEMORY into the runtime request; record the exact text that should prevent promise-only completion.
4. Trace `agentLoop` termination: assistant text-only message, tool call execution, `prepareNextTurn`, `shouldStopAfterTurn`, `getSteeringMessages`, `getFollowUpMessages`, final `agent_end`.
5. Trace `sessions.send` request schema, handler, tool wrapper, wait path, response shape, delivery-context extraction, and channel send path.

### Diagnose

1. Decide which condition regressed: prompt instruction removed, new loop stop semantics, tool-call evidence no longer tracked, or caller delivery contract mismatch.
2. For promise-only completion, write the narrowest proposed invariant: actionable request plus no tool calls/results plus promise-only assistant text must continue or report a blocker.
3. For session delivery, write the exact caller contract: when to use `sessions.send`, `chat.send`, `deliver`, `timeoutMs`, `sessionKey`, and how final text is returned or delivered.
4. If a fix is safe, scope it to one seam and tests; otherwise produce report-only findings and follow-up tasks.

### Write Report

1. Before the final investigation report step, run `python3 scripts/investigation-path.py --task-id quick-wave-8890 --project . --touch` when the helper exists.
2. If `scripts/investigation-path.py` is missing, create `plans/investigations/` if needed and write `plans/investigations/quick-wave-8890_investigate-openclaw-post-upstream-sync-runtime-regression.md`.
3. Include exact commits, old/new files compared, reproduction commands/results, root cause, whether a fix was applied, test evidence, and follow-up tasks.

## Files to Modify

| File                                                                                           | Planned Action                                                                                    |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `plans/investigations/quick-wave-8890_*.md`                                                    | Write final investigation report only after reproduce/trace/diagnose.                             |
| `packages/agent-core/src/agent-loop.test.ts`                                                   | Conditional: add promise-only/action-evidence regression tests if runtime fix is chosen.          |
| `packages/agent-core/src/agent-loop.ts`                                                        | Conditional: add minimal guard only if diagnosis proves runtime stop semantics caused regression. |
| `packages/agent-core/src/harness/system-prompt.ts` or prompt assembly caller                   | Conditional: reinforce action-evidence prompt only if prompt diff is root cause.                  |
| `src/gateway/server.sessions-send.test.ts`                                                     | Conditional: add delivery/timeout contract tests if session delivery seam is unclear or broken.   |
| `src/gateway/server-methods/sessions.ts` or `packages/gateway-protocol/src/schema/sessions.ts` | Conditional: adjust `sessions.send` behavior/schema only if existing contract is insufficient.    |

## TDD

Use only if the investigation proceeds from report-only diagnosis to a code fix.

**Workflow for implementing agent:**

1. Implement TDD cycle via `skill:tdd`.
2. Add failing tests before runtime/prompt/session changes.
3. Run targeted RED tests.
4. Implement the narrow fix.
5. Run targeted GREEN tests, then relevant changed checks.

### Targeted Tests

**Test file:** `packages/agent-core/src/agent-loop.test.ts`  
**Framework:** Vitest; existing file already tests loop event behavior.  
**Run command:** `pnpm test packages/agent-core/src/agent-loop.test.ts`  
**Edit hint:** append a new `describe("agentLoop actionable completion guard", ...)` block.

```ts
import { describe, expect, it } from "vitest";
import { agentLoop } from "./agent-loop.js";
import { createAssistantMessageEventStream } from "./llm.js";
import type { AssistantMessage, Message, Model } from "./llm.js";
import type { AgentEvent, AgentLoopConfig, StreamFn } from "./types.js";

const model: Model = {
  id: "test-model",
  name: "Test Model",
  api: "test-api",
  provider: "test-provider",
  baseUrl: "https://example.test",
  reasoning: false,
  input: ["text"],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 1000,
  maxTokens: 1000,
};

const config: AgentLoopConfig = {
  model,
  convertToLlm: (messages) => messages as Message[],
};

async function collectEvents(stream: AsyncIterable<AgentEvent>): Promise<AgentEvent[]> {
  const events: AgentEvent[] = [];
  for await (const event of stream) events.push(event);
  return events;
}

function textResponse(text: string): ReturnType<typeof createAssistantMessageEventStream> {
  const stream = createAssistantMessageEventStream();
  const message: AssistantMessage = {
    role: "assistant",
    content: [{ type: "text", text }],
    api: model.api,
    provider: model.provider,
    model: model.id,
    usage: {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
      totalTokens: 0,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    },
    stopReason: "stop",
    timestamp: 1,
  };
  queueMicrotask(() => {
    stream.push({ type: "start", partial: message });
    stream.push({ type: "done", reason: "stop", message });
  });
  return stream;
}

describe("agentLoop actionable completion guard", () => {
  it("does not complete an actionable turn on promise-only text without tool evidence", async () => {
    let calls = 0;
    const streamFn: StreamFn = async () => {
      calls += 1;
      return textResponse(
        calls === 1
          ? "I'll create the task."
          : "I could not create it because no task tool is available.",
      );
    };

    const stream = agentLoop(
      [{ role: "user", content: "Create a task for the restart.", timestamp: 1 }],
      { systemPrompt: "", messages: [] },
      config,
      undefined,
      streamFn,
    );
    await collectEvents(stream);

    expect(calls).toBeGreaterThan(1); // RED: current loop stops after the first text-only promise.
  });
});
```

| Test                              | RED                                                                            | GREEN                                                               |
| --------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| promise-only actionable turn      | `calls` is `1` because the loop ends after text-only assistant output          | loop continues or reports a blocker with evidence-aware termination |
| action request with tool evidence | add only if guard is implemented; current tool-call flow should still complete | tool call result plus final text completes normally                 |
| non-actional advice               | add only if guard is implemented; advice must not be forced into tools         | text-only answer completes normally                                 |

**Test file:** `src/gateway/server.sessions-send.test.ts`  
**Run command:** `pnpm test src/gateway/server.sessions-send.test.ts`  
**Cases:** `timeoutMs: 0`, omitted timeout, `deliver: true` or equivalent channel session delivery path, and response shape consumed by Mission Control.

### Regression

- [ ] `pnpm test packages/agent-core/src/agent-loop.test.ts`
- [ ] `pnpm test src/gateway/server.sessions-send.test.ts`
- [ ] Use `openclaw-testing` to choose any broader local or Crabbox proof if runtime/session delivery code changes.
- [ ] Run `autoreview` after any code fix.

## Dependencies

- Branch refs must exist locally: `backup/pre-clean-upstream-sync-post-wip-20260609-154137`, `sync/clean-upstream-20260609`.
- Do not mutate live OpenClaw config; document required config/caller changes instead.
- Preserve approval and user-safety semantics; promise-only detection must not bypass approvals or force unsafe actions.

---

_Created: 2026-06-10_
_Status: DRAFT_
