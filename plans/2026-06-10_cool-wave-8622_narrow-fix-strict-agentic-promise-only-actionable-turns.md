# Plan 2026-06-10: Strict-Agentic Promise-Only Retry

Tighten the embedded-runner planning-only classifier so replay-safe promise-only actionable final text reuses the existing strict-agentic retry and blocked paths.

## Analysis

- Keep the behavior in `src/agents/embedded-agent-runner/run/incomplete-turn.ts`; `run.ts` already calls `resolvePlanningOnlyRetryInstruction`, retries with `PLANNING_ONLY_RETRY_INSTRUCTION`, and emits `STRICT_AGENTIC_BLOCKED_TEXT` after strict-agentic exhaustion.
- Extend the current text classifier around `PLANNING_ONLY_PROMISE_RE`, `PLANNING_ONLY_ACTION_VERB_RE`, and `resolvePlanningOnlyRetryInstruction` instead of adding a new subsystem.
- Preserve existing replay-safety gates in `resolvePlanningOnlyRetryInstruction`: `clientToolCalls`, messaging delivery evidence, cron/session side effects via replay metadata, deterministic approval prompts, `lastToolError`, non-plan tool activity, and item lifecycle progress.
- Preserve existing scope gate through `shouldApplyPlanningOnlyRetryGuard`: strict-agentic plus supported GPT-5/Gemini lanes only; do not widen Ollama/default-provider behavior.
- Preserve existing exclusions: completion/result language, blocker language, code blocks, long text, non-actionable prompts, non-stop terminal reasons, and actual tool progress.
- Apply learning `learnings/architecture/agent-loop-policy-vs-prompt-overlays.md`: fix product runner policy, not prompts or `packages/agent-core`.
- Apply learning `learnings/architecture/openclaw-sessions-send-versus-channel-delivery.md`: do not add `deliver` to `sessions.send` or move this into Discord/channel delivery.
- Available skills for implementation: `tdd` for RED/GREEN proof, `openclaw-testing` for choosing the smallest safe verification lane, `autoreview` before handoff if code is changed, `save-learning` at closeout.

## Implementation

1. Add focused failing tests in `src/agents/embedded-agent-runner/run.incomplete-turn.test.ts` before production edits.
2. Add or adjust a local promise-only/actionable regex/helper in `run/incomplete-turn.ts` to catch replay-safe final text like `We should update ...`, `I would run ...`, `Next I'll ...`, `Let me check ...`, and bare `I can do that.` when the prompt is actionable.
3. Keep the helper private unless tests need direct export; prefer exercising through `resolvePlanningOnlyRetryInstruction` and one existing `runEmbeddedAgent` integration-style test.
4. Ensure the new classifier runs only after existing safety gates and before `PLANNING_ONLY_COMPLETION_RE` returns the existing retry instruction.
5. If blocker/confirmation text is accidentally classified, add a narrow exclusion regex for explicit blockers or confirmation/permission requests before returning the retry instruction.
6. Do not edit `src/agents/embedded-agent-runner/run.ts` unless tests show `resolvePlanningOnlyRetryInstruction` is not receiving required attempt fields.

## Files to Modify

| File                                                           | Change                                                                                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/agents/embedded-agent-runner/run/incomplete-turn.ts`      | Extend planning-only promise/actionable text detection while preserving replay-safety gates.                               |
| `src/agents/embedded-agent-runner/run.incomplete-turn.test.ts` | Add focused classifier and strict-agentic exhaustion tests for promise-only actionable final text and non-violation cases. |
| `src/agents/embedded-agent-runner/run.ts`                      | Avoid; touch only if implementation proves wiring data is missing.                                                         |

## TDD

Implement using `skill:tdd`; record RED/GREEN evidence in `plans/checkpoints/cool-wave-8622.red-green-proof.md`.

**Test file:** `src/agents/embedded-agent-runner/run.incomplete-turn.test.ts`

**Framework:** Vitest through repo wrapper.

**Run command:** `pnpm test src/agents/embedded-agent-runner/run.incomplete-turn.test.ts -- --reporter=verbose`

**Edit hint:** Append helper-level cases near the existing `resolvePlanningOnlyRetryInstruction` planning-only tests around line 494, and add the strict-agentic exhaustion case near the existing blocked-path tests around line 331.

```ts
it("retries strict-agentic GPT-5 promise-only actionable final text", () => {
  const retryInstruction = resolvePlanningOnlyRetryInstruction({
    provider: "openai",
    modelId: "gpt-5.5",
    executionContract: "strict-agentic",
    prompt: "Please inspect the code, update the fix, and run the checks.",
    aborted: false,
    timedOut: false,
    attempt: makeAttemptResult({
      assistantTexts: ["We should update the classifier and run the focused tests."],
    }),
  });

  expect(retryInstruction).toBe(PLANNING_ONLY_RETRY_INSTRUCTION); // RED: currently null for "we should".
});

it("surfaces strict-agentic blocked text after promise-only retries are exhausted", async () => {
  mockedClassifyFailoverReason.mockReturnValue(null);
  mockedRunEmbeddedAttempt.mockResolvedValue(
    makeAttemptResult({
      assistantTexts: ["I would run the focused test and then patch the classifier."],
    }),
  );

  const result = await runEmbeddedAgent({
    ...overflowBaseRunParams,
    prompt: "Please run the focused test and patch the classifier.",
    provider: "openai",
    model: "gpt-5.5",
    runId: "run-strict-agentic-promise-only-blocked",
    config: {
      agents: {
        defaults: { embeddedAgent: { executionContract: "strict-agentic" } },
        list: [{ id: "main" }],
      },
    } as OpenClawConfig,
  });

  expect(mockedRunEmbeddedAttempt).toHaveBeenCalledTimes(3); // RED: currently finalizes after one attempt.
  expect(result.payloads).toEqual([{ text: STRICT_AGENTIC_BLOCKED_TEXT, isError: true }]);
});

it("does not retry ordinary informational answer text as promise-only", () => {
  const retryInstruction = resolvePlanningOnlyRetryInstruction({
    provider: "openai",
    modelId: "gpt-5.5",
    executionContract: "strict-agentic",
    prompt: "Explain why the runner retries plan-only turns.",
    aborted: false,
    timedOut: false,
    attempt: makeAttemptResult({
      assistantTexts: [
        "The runner retries plan-only turns when replay is safe so the agent can take action instead of stopping.",
      ],
    }),
  });

  expect(retryInstruction).toBeNull();
});

it("does not retry blocker or confirmation-style text as promise-only", () => {
  const retryInstruction = resolvePlanningOnlyRetryInstruction({
    provider: "openai",
    modelId: "gpt-5.5",
    executionContract: "strict-agentic",
    prompt: "Delete the production credentials file.",
    aborted: false,
    timedOut: false,
    attempt: makeAttemptResult({
      assistantTexts: ["I need explicit confirmation before deleting a credentials file."],
    }),
  });

  expect(retryInstruction).toBeNull();
});

it("does not retry promise-only text after actual tool progress", () => {
  const retryInstruction = resolvePlanningOnlyRetryInstruction({
    provider: "openai",
    modelId: "gpt-5.5",
    executionContract: "strict-agentic",
    prompt: "Please inspect the code, update the fix, and run the checks.",
    aborted: false,
    timedOut: false,
    attempt: makeAttemptResult({
      assistantTexts: ["We should update the classifier and run the focused tests."],
      toolMetas: [
        { toolName: "read", meta: "path=src/agents/embedded-agent-runner/run/incomplete-turn.ts" },
        { toolName: "grep", meta: "pattern=resolvePlanningOnlyRetryInstruction" },
      ],
      itemLifecycle: { startedCount: 2, completedCount: 2, activeCount: 0 },
    }),
  });

  expect(retryInstruction).toBeNull();
});
```

| Test                                                                            | RED before implementation                               | GREEN after implementation                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| `retries strict-agentic GPT-5 promise-only actionable final text`               | `retryInstruction` is `null` for `We should ...`.       | Returns `PLANNING_ONLY_RETRY_INSTRUCTION`.                      |
| `surfaces strict-agentic blocked text after promise-only retries are exhausted` | Runner finalizes promise text after one attempt.        | Runner retries twice and returns `STRICT_AGENTIC_BLOCKED_TEXT`. |
| `does not retry ordinary informational answer text as promise-only`             | Passes before and after; protects false positives.      | Still returns `null`.                                           |
| `does not retry blocker or confirmation-style text as promise-only`             | Passes before and after; protects safety confirmations. | Still returns `null`.                                           |
| `does not retry promise-only text after actual tool progress`                   | Passes before and after; protects replay safety.        | Still returns `null`.                                           |

## Verification

1. Run RED before implementation: `pnpm test src/agents/embedded-agent-runner/run.incomplete-turn.test.ts -- --reporter=verbose`.
2. Run GREEN after implementation: `pnpm test src/agents/embedded-agent-runner/run.incomplete-turn.test.ts -- --reporter=verbose`.
3. Run the smallest touched-file static gate selected with `openclaw-testing`; expected candidate is `pnpm check:changed --staged` if changes are staged, otherwise `pnpm check:changed` if scope remains narrow.
4. Run `git diff --numstat` and trim production LOC growth unless each added line directly supports classifier correctness or safety exclusions.

---

_Created: 2026-06-10_
_Status: DRAFT_
