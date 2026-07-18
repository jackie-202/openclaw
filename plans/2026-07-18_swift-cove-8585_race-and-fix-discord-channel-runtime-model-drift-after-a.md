# Plan 2026-07-18: Fix Discord channel runtime model drift

_Status: DRAFT_

## Progress

- [x] Phase 0: config and canonical path
- [x] Phase 1: bounded source and test research
- [x] Phase 2: prior-knowledge constraints
- [x] Phase 3: implementation and verification synthesis

## Analysis

### Codebase context

- `src/channels/model-overrides.ts:284` resolves an exact Discord `runtimeByChannel` entry before the legacy model fallback; `src/channels/model-overrides.test.ts:226` already proves the Einstein channel identity resolves a complete profile.
- `src/auto-reply/reply/get-reply.ts:566` supplies the resolved profile to model selection. Ordinary persisted runtime metadata (`modelProvider`/`model`) is not consulted, but direct or parent `providerOverride`/`modelOverride` can replace the channel model at `src/auto-reply/reply/get-reply.ts:596` and again at `src/auto-reply/reply/model-selection.ts:320`.
- `src/auto-reply/reply/get-reply-directives.ts:527` creates the final model state, then `src/auto-reply/reply/get-reply.ts:871` passes its provider/model to `runPreparedReply`.
- `src/auto-reply/reply/get-reply-run.ts:1246` copies that selection into `followupRun.run`; `src/auto-reply/reply/agent-runner.ts:1621` passes it to execution without a pre-run session-model rewrite.
- `src/auto-reply/reply/agent-runner.ts:1710` records the actual winner, and `src/auto-reply/reply/session-usage.ts:188` persists it as `modelProvider`/`model`. These fields are runtime history, not explicit selection overrides.
- Current coverage stops before the actual run boundary: `src/auto-reply/reply/get-reply.fast-path.test.ts:337` asserts only arguments entering mocked directive resolution. It does not prove final run parameters or post-run persistence.
- Static inspection does not prove the reported Ollama writer. The characterization must distinguish exact-session user override, inherited parent override, stale auto-fallback state, ordinary runtime metadata, and an unrelated session before changing precedence.

### Relevant documentation

- No product docs or PlantUML changes are needed for a bounded bug fix.
- `src/channels/AGENTS.md:49` requires shared-channel regression coverage; `src/channels/AGENTS.md:53` requires a build if the channel hot path changes.

### Knowledge base

- `learnings/architecture/openclaw-channel-runtime-profile-resolver-seam.md:18` keeps explicit persisted session choices above channel profiles and requires all consumers to use the central resolver.
- `learnings/architecture/channel-runtime-profile-execution-precedence.md:23` treats the profile model as the selection seed and session/directive state as stronger only when explicit.
- `learnings/architecture/bold-peak-9726-channel-runtime-profiles-must-reach-every-execution-path.md:9` requires runtime-only tests at dispatch boundaries rather than resolver-only coverage.
- `learnings/patterns/bold-peak-9726-merge-canonical-runtime-settings-with-legacy-fallback-centrally.md:9` forbids duplicating channel matching or legacy fallback logic in callers.

## Available Skills

- `tdd`: run the required RED/GREEN cycle and save proof under `plans/checkpoints/swift-cove-8585.red-green-proof.md`.
- `recall-knowledge`: recheck relevant runtime-profile learnings before changing precedence.
- `code-review`: perform the fresh pre-handoff review required by repository policy.
- `save-learning`: capture the proven resolver/writer lesson as the final implementation-session action.

## Solution

Characterize the complete Einstein-shaped inbound turn first. Record provider/model at five seams: profile resolver, initial selection, final `createModelSelectionState`, `followupRun.run`, and persisted runtime fields. Change only the first seam where Fable is replaced.

- If stale `modelProvider`/`model` causes the failure, stop and identify the direct hydration writer because current selectors should ignore those fields; do not weaken explicit `/model` precedence.
- If an auto-generated or inherited override is incorrectly classified as an explicit same-session user choice, correct that classification at `resolveStoredModelOverride`/`createModelSelectionState` and clear only the proven stale state.
- If the resolver receives the wrong conversation identity, fix the inbound identity handoff without changing matching rules.
- If no test can reproduce the first writer, add bounded model-source provenance (`channel-runtime-profile`, `explicit-session-override`, `explicit-model-command`, `session-hydration`, `global-default`) at the selection/run boundary and stop with an RCA; do not rewrite shared resolution speculatively.

## Implementation

1. Implement the TDD cycle with `skill:tdd`: add the Einstein-shaped full-boundary test, run it alone, and save the genuine RED output.
2. Seed only the exact Einstein session with stale `modelProvider: "ollama"` and `model: "qwen3-coder-next-q6k:latest"`; seed `agent:main:current` separately with conflicting explicit overrides. Assert the exact channel profile resolves to Fable and the unrelated entry is never consulted.
3. Drive the continuation through final `runPreparedReply`/`followupRun.run` capture instead of stopping at mocked directive arguments. Complete one successful mocked agent result so normal accounting persists `copilot/claude-fable-5` with no fallback attempts.
4. Add two adjacent controls: an unprofiled Discord channel follows the existing global default, and an exact Einstein `modelOverrideSource: "user"` produced by `/model` retains precedence.
5. At each seam, compare expected `copilot/claude-fable-5` with actual provider/model and name the first replacement plus the field and session key that supplied it.
6. Apply the smallest correction at that seam. Keep `resolveChannelRuntimeProfile` matching centralized, preserve genuine fallback handling, and do not alter the global default or model allowlist schema.
7. Assert post-run storage contains `modelProvider: "copilot"` and `model: "claude-fable-5"`, while explicit override fields remain absent unless the `/model` control created them.
8. If the RED cannot be produced from the bounded state, add source provenance only, test its source labels, and finish with the bounded RCA rather than a behavioral patch.
9. Run focused tests, `pnpm tsgo`, and `pnpm build`; then perform a fresh review and address accepted findings.
10. Report the first broken seam/writer, changed files, RED/GREEN commands and results, default/override controls, typecheck/build results, remaining unverified live risk, and rollback as reverting code/tests only. Do not touch live config, sessions, installation, deployment, or Gateway process state.

## Files to Modify

| File                                                          | Change                                                                                                                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/auto-reply/reply/get-reply.fast-path.test.ts`            | Extend the Einstein fixture through final prepared-run parameters; pin default, explicit same-session override, and unrelated-session isolation.            |
| `src/auto-reply/reply/agent-runner.runreplyagent.e2e.test.ts` | Prove successful Fable execution persists Fable runtime metadata without fabricated fallback, if the existing harness is needed for the post-run assertion. |
| Proven broken seam only                                       | Minimal production fix in `get-reply.ts`, `get-reply-directives.ts`, `model-selection.ts`, or its directly named callee.                                    |
| `plans/checkpoints/swift-cove-8585.red-green-proof.md`        | Record exact RED/GREEN commands, outputs, and first-divergence evidence.                                                                                    |

Do not modify `src/channels/model-overrides.ts` unless the exact Einstein resolver assertion itself fails.

## TDD

Implementace TDD cyklu dle skill:tdd.

**Primary test file:** `src/auto-reply/reply/get-reply.fast-path.test.ts`

**Focused RED command:** `pnpm test src/auto-reply/reply/get-reply.fast-path.test.ts src/channels/model-overrides.test.ts -- --reporter=verbose`

**Append to the existing `describe`; use the file's existing imports, mocks, and helpers:**

```ts
it("keeps the Einstein runtime profile authoritative over stale runtime metadata", async () => {
  const target = "1494790764134273195";
  const sessionKey = `agent:main:discord:channel:${target}`;
  const sessionEntry = {
    sessionId: "a6eaa5bb-58de-46da-b30e-eb3597c533cb",
    updatedAt: 1,
    channel: "discord",
    chatType: "channel" as const,
    groupId: target,
    modelProvider: "ollama",
    model: "qwen3-coder-next-q6k:latest",
  };
  mocks.initSessionState.mockResolvedValueOnce(
    createGetReplySessionState({
      sessionCtx: { Provider: "discord", ChatType: "channel", SessionKey: sessionKey },
      sessionEntry,
      sessionStore: {
        [sessionKey]: sessionEntry,
        "agent:main:current": {
          sessionId: "unrelated",
          updatedAt: 1,
          providerOverride: "ollama",
          modelOverride: "qwen3-coder-next-q6k:latest",
          modelOverrideSource: "user",
        },
      },
      sessionKey,
      groupResolution: { channel: "discord", id: target },
      isGroup: true,
    }),
  );
  mocks.resolveReplyDirectives.mockImplementationOnce(async (params: unknown) => {
    const selected = params as { provider: string; model: string; triggerBodyNormalized: string };
    return createGetReplyContinueDirectivesResult({
      body: selected.triggerBodyNormalized,
      abortKey: sessionKey,
      from: `discord:channel:${target}`,
      to: `discord:channel:${target}`,
      senderId: "einstein-user",
      commandSource: selected.triggerBodyNormalized,
      senderIsOwner: true,
      resetHookTriggered: false,
      provider: selected.provider,
      model: selected.model,
    });
  });

  await getReplyFromConfig(
    buildGetReplyCtx({
      Provider: "discord",
      Surface: "discord",
      ChatType: "channel",
      SessionKey: sessionKey,
      From: `discord:channel:${target}`,
      To: `discord:channel:${target}`,
    }),
    undefined,
    {
      agents: { defaults: { model: "openai/gpt-5.5" } },
      channels: {
        runtimeByChannel: {
          discord: { [target]: { model: "copilot/claude-fable-5" } },
        },
      },
    } as OpenClawConfig,
  );

  // RED: the observed bug supplies Ollama before the prepared run.
  expect(requirePreparedReplyParams()).toMatchObject({
    provider: "copilot",
    model: "claude-fable-5",
  });
});
```

| Test                                | RED                                                                            | GREEN                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Einstein stale runtime metadata     | Prepared run receives Ollama or the first earlier seam differs from Fable.     | Prepared run receives `copilot/claude-fable-5`.                                  |
| Post-run persistence                | Stored `modelProvider`/`model` remain Ollama or diverge from the selected run. | Stored runtime pair is `copilot/claude-fable-5`; no fallback provenance appears. |
| Unprofiled Discord channel          | Global/default selection changes.                                              | Existing global/default selection remains unchanged.                             |
| Exact-session `/model`              | Channel profile incorrectly suppresses the user override.                      | User override remains authoritative.                                             |
| Unrelated current/requester session | Einstein inherits its Ollama override.                                         | Only the exact Einstein session and valid parent are eligible.                   |

## Verification

- RED/GREEN: `pnpm test src/auto-reply/reply/get-reply.fast-path.test.ts src/channels/model-overrides.test.ts -- --reporter=verbose`
- Persistence path when touched: `pnpm test src/auto-reply/reply/agent-runner.runreplyagent.e2e.test.ts -- --reporter=verbose`
- Relevant typecheck: `pnpm tsgo`
- Runtime/build boundary: `pnpm build`
- Review diff scope and confirm no live files under `~/.openclaw`, generated install links, deployment files, or Gateway lifecycle actions changed.
