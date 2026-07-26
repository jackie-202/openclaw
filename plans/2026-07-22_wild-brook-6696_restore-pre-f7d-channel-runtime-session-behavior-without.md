# Plan 2026-07-22: Restore channel runtime session behavior

Apply characterization-first isolation to identify which `f7d039a` execution field changes terminal session behavior, then roll back only that propagation while retaining profile model selection wherever the transition matrix proves it safe.

*Status: DRAFT*

## Progress

- [x] Config and plan initialization
- [x] Regression-boundary research
- [x] Repository knowledge and test-contract research
- [x] Implementation and verification synthesis

## Analysis

### Codebase context

- `src/auto-reply/reply/get-reply.ts:468` initializes the canonical session before resolving `runtimeByChannel` at `src/auto-reply/reply/get-reply.ts:566`; profile values then enter fast and normal run construction at `src/auto-reply/reply/get-reply.ts:667` and `src/auto-reply/reply/get-reply.ts:978`.
- `src/auto-reply/reply/session.ts:423` owns freshness/reset rollover, clears runtime queues for replaced sessions at `src/auto-reply/reply/session.ts:498`, creates the replacement entry at `src/auto-reply/reply/session.ts:645`, and archives the prior transcript at `src/auto-reply/reply/session.ts:843`.
- `src/auto-reply/reply/get-reply-run.ts:1120` selects follow-up behavior and snapshots provider/model plus thinking/reasoning/stream parameters into `FollowupRun` at `src/auto-reply/reply/get-reply-run.ts:1246`.
- `src/auto-reply/reply/reply-turn-admission.ts:27` waits for session ownership and adopts the completed owner's session ID; `src/auto-reply/reply/queue/state.ts:106` retargets queued snapshots after compaction rotation.
- `src/agents/embedded-agent-runner/run.ts:2088` owns context-overflow detection, compaction, retry, and explicit exhausted-recovery errors; callers persist rotated identity and refresh queued work.
- Existing proofs are split across `src/auto-reply/reply/get-reply.fast-path.test.ts`, `src/auto-reply/reply/get-reply-directives.target-session.test.ts`, `src/auto-reply/reply/session.test.ts`, `src/auto-reply/reply/followup-runner.test.ts`, `src/auto-reply/reply/agent-runner-execution.test.ts`, and `src/agents/embedded-agent-runner/run.overflow-compaction.loop.test.ts`; no test composes profile selection with rollover/rotation and queued completion.

### Commit boundary

- `f7d039a3575cc6a563e02bdcfd29793a9cc6fec6` added four independently testable behaviors: profile model selection in fresh/normal paths, profile thinking/reasoning defaults, `textVerbosity` in immediate/queued run snapshots, and profile model selection in native-slash handling.
- `0529559822f1bfb008b329dcdb31b00e70192cb5` rejects stale automatic fallback pins when their recorded origin no longer matches the profile-derived primary; retain this behavior.
- `435059f7d634a3300dd7533b707e8ccfe73008e0` made `runtimeByChannel` independent from removed legacy `modelByChannel`; do not restore composite fallback plumbing.
- Pre-`f7d` source had no profile thinking/reasoning/text-verbosity propagation and did not select the profile model in native slash, while its normal channel model override path already preserved session-first model precedence.

### Documentation and project rules

- Root `AGENTS.md` requires characterization against current source, callers, sibling paths, tests, and commit history; session terminal outcomes must use the canonical runner result paths.
- `src/channels/AGENTS.md` requires shared channel changes to remain core-owned and checked across reply behavior; no plugin boundary change is needed.
- `src/agents/AGENTS.md` favors narrow injected runtime tests over loading full provider/channel runtimes.
- No product documentation change is expected unless evidence requires intentionally narrowing the public `runtimeByChannel` field behavior.

### Knowledge base

- `learnings/architecture/auto-fallback-origin-must-match-current-primary.md` requires preserving user overrides and valid fallback provenance while testing the final prepared provider/model.
- `learnings/architecture/distinguish-session-runtime-history-from-model-selection-overrides.md` separates post-run model history from authoritative session overrides and identifies each selection seam to assert.
- `learnings/architecture/bold-peak-9726-channel-runtime-profiles-must-reach-every-execution-path.md` requires runtime-only control coverage across normal and native paths.
- `learnings/architecture/channel-runtime-profile-execution-precedence.md` documents the intended pre-regression precedence, but observed lifecycle evidence takes priority if a non-model field is causal.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent.

## Available Skills

- `tdd`: execute the required characterization-first RED/GREEN cycle and save proof.
- `openclaw-testing`: choose focused and broader OpenClaw verification gates.
- `autoreview`: perform the mandatory fresh pre-handoff code review after implementation.
- `save-learning`: record implementation findings as the final task action.

## Implementation

1. Use `skill:tdd` to create `src/auto-reply/reply/channel-runtime-session-lifecycle.test.ts` and `plans/checkpoints/wild-brook-6696.red-green-proof.md` before changing production code.
2. Build one deterministic Discord harness around session key `agent:main:discord:channel:1510566522190303313`. Give every accepted turn a message ID, queued lifecycle callbacks, and a mocked embedded-run terminal result so the test can distinguish executed, explicitly failed, retried, and silently cleared work.
3. Run the same transition table with no profile, model-only profile, and full profile (`model`, `thinkingLevel`, `reasoningLevel`, `textVerbosity`).
4. Existing-session row: complete one dispatched turn and assert one terminal outcome.
5. Fresh-session row: complete the first dispatched turn and assert profile/default precedence.
6. Rollover row: accept a second turn while the first owns the session, perform `/new`, and require the accepted turn to execute on the replacement session or receive an explicit terminal failure/retry signal.
7. Overflow row: return a context-overflow attempt, require compaction plus retry or an explicit terminal result, and assert queued work uses any rotated session ID/file.
8. Follow-up row: verify provider/model and request parameters on both immediate and drained runs.
9. Capture RED only if the full-profile case diverges from the no-profile control. Add one-field variants to isolate the first causal `f7d039a` addition. If the control fails identically, stop production edits and correct the regression boundary instead of attributing generic queue cleanup to runtime profiles.
10. Keep `channelRuntimeProfile.model` in normal fresh/existing selection when model-only cases pass.
11. Remove or defer only a proven causal `thinkingLevel`, `reasoningLevel`, or `textVerbosity` value from fresh/reset/retry and queued snapshots, while preserving explicit directive/session precedence.
12. Restore pre-`f7d` native-slash provider/model use only if the native path alone causes rollover/ownership divergence.
13. If queued identity is the divergence, refresh the existing `FollowupRun` snapshot during admission/rotation rather than adding a second queue or compatibility path.
14. Update adjacent tests to encode one precedence contract across normal reply, fast directive, native slash, and follow-up drain. Keep `0529559822` stale-auto-fallback assertions and `435059f7d6` legacy-removal assertions unchanged.
15. Record the exact causal hunk, RED/GREEN commands, transition outcomes, and any intentionally unsupported profile field in `plans/checkpoints/wild-brook-6696.checkpoint.md`; do not edit Mission Control, Issue Grill, channel IDs, prompts, allowlists, scripts, config schema, or `plans/tasks/`.
16. Run `skill:autoreview` after implementation and targeted verification; resolve all accepted findings before broader checks.
17. Run `skill:save-learning` as the final implementation action and save at least one learning covering the isolated lifecycle invariant and rollback boundary.

## Files to Modify

| File | Change |
| --- | --- |
| `src/auto-reply/reply/channel-runtime-session-lifecycle.test.ts` | Add the profile/control transition matrix and durable terminal-outcome assertions. |
| `src/auto-reply/reply/get-reply.fast-path.runtime.test.ts` | Add the field-isolation RED skeleton below. |
| `src/auto-reply/reply/get-reply.ts` | Retain model precedence; stop forwarding only the profile field/path proven causal. |
| `src/auto-reply/reply/get-reply-directives.ts` | Adjust channel defaults only if field-isolation RED identifies directive propagation. |
| `src/auto-reply/reply/get-reply-native-slash-fast-path.ts` | Restore pre-`f7d` native behavior only if native characterization fails independently. |
| `src/auto-reply/reply/get-reply-run.ts` | Preserve terminal ownership and queued execution parameters at immediate/follow-up construction. |
| `src/auto-reply/reply/agent-runner-run-params.ts` | Remove/defer a request parameter only if forwarding is the isolated cause. |
| `src/auto-reply/reply/queue/types.ts` | Narrow the queued snapshot type only when the corresponding runtime field is removed. |
| `src/agents/command/shared-types.ts` | Narrow `AgentStreamParams` only if no unaffected caller still needs the field. |
| Adjacent existing tests listed under Verification | Update only assertions whose proven runtime contract changes. |
| `plans/checkpoints/wild-brook-6696.red-green-proof.md` | Persist genuine pre-change RED and post-change GREEN output. |
| `plans/checkpoints/wild-brook-6696.checkpoint.md` | Link this plan and summarize causal evidence and verification. |

Do not modify `src/channels/model-overrides.ts` unless resolver output itself fails the control matrix; never restore `channels.modelByChannel` fallback composition.

## TDD

Implement the TDD cycle with `skill:tdd`. Start by appending the following field-isolation case to `src/auto-reply/reply/get-reply.fast-path.runtime.test.ts`; use the lifecycle matrix above as the behavior-level RED before accepting any production rollback.

**Test file:** `src/auto-reply/reply/get-reply.fast-path.runtime.test.ts`  
**Run command:** `pnpm test src/auto-reply/reply/get-reply.fast-path.runtime.test.ts -t "keeps profile model selection separate from fresh-session execution defaults"`

```ts
it("keeps profile model selection separate from fresh-session execution defaults", async () => {
  await withTempHome(async (home) => {
    agentMocks.runEmbeddedAgent.mockResolvedValue(makeEmbeddedTextResult("completed"));
    const channelId = "1510566522190303313";
    const config = makeReplyConfig(home) as OpenClawConfig;
    config.channels = {
      ...config.channels,
      runtimeByChannel: {
        discord: {
          [channelId]: {
            model: "anthropic/claude-opus-4-6",
            thinkingLevel: "high",
            reasoningLevel: "on",
            textVerbosity: "low",
          },
        },
      },
    };

    await expect(
      getReplyFromConfig(
        {
          Body: "durable request",
          BodyForAgent: "durable request",
          RawBody: "durable request",
          CommandBody: "durable request",
          MessageSid: "b1bb3b3f-d241-4319-afc6-d54a7591919b",
          SessionKey: `agent:main:discord:channel:${channelId}`,
          Provider: "discord",
          Surface: "discord",
          OriginatingChannel: "discord",
          From: `discord:channel:${channelId}`,
          To: `discord:channel:${channelId}`,
          ChatType: "channel",
          CommandAuthorized: true,
        },
        {},
        config,
      ),
    ).resolves.toMatchObject({ text: "completed" });

    expect(agentMocks.runEmbeddedAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-opus-4-6",
        thinkLevel: undefined,
        reasoningLevel: "off",
        streamParams: undefined,
      }),
    );
  });
});
```

| Test | RED on current behavior | GREEN after isolated correction |
| --- | --- | --- |
| Fresh field isolation skeleton | Receives profile `high`/`on`/`{ textVerbosity: "low" }` instead of pre-`f7d` execution defaults. | Profile model remains selected while unsupported session-sensitive fields use pre-`f7d` defaults. |
| Profile/control lifecycle matrix | Accepted profile turn lacks execution or explicit terminal outcome on the reproduced transition. | Every accepted turn completes, retries, or fails explicitly; control remains unchanged. |
| Overflow plus queued rotation | Compaction/retry is skipped or queued run retains abandoned identity. | Compaction retries or returns terminal failure; queued run adopts the rotated identity and retains safe parameters. |

If lifecycle isolation proves model, native selection, or only one non-model field causal, replace the skeleton's non-causal expectations before GREEN; do not force all three removals merely to satisfy this provisional RED.

## Verification

1. Focused RED/GREEN: `pnpm test src/auto-reply/reply/channel-runtime-session-lifecycle.test.ts src/auto-reply/reply/get-reply.fast-path.runtime.test.ts -- --reporter=verbose`.
2. Reply/profile precedence: `pnpm test src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/get-reply-directives.target-session.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/channels/model-overrides.test.ts`.
3. Queue and rollover: `pnpm test src/auto-reply/reply/get-reply-run-queue.test.ts src/auto-reply/reply/reply-turn-admission.test.ts src/auto-reply/reply/followup-runner.test.ts src/auto-reply/reply/session-reset-cleanup.test.ts src/auto-reply/reply/session-hooks-context.test.ts`.
4. Overflow terminal behavior: `pnpm test src/agents/embedded-agent-runner/run.overflow-compaction.loop.test.ts src/agents/embedded-agent-runner/run.overflow-compaction.test.ts src/auto-reply/reply/agent-runner-execution.test.ts`.
5. Type/build gates: `pnpm tsgo:core` and `pnpm build`.
6. Use `skill:openclaw-testing` to select the smallest relevant broader changed gate, normally `pnpm check:changed`; move broad or resource-heavy proof to Testbox/Crabbox and record its provider/run ID.
7. Record unrelated failures verbatim rather than changing baselines or suppressing checks.
