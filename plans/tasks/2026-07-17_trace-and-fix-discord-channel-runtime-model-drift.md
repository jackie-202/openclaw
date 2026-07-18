# Fix Einstein Discord runtime model selection at the inbound execution boundary

## Problem

Discord channel `#einstein-mode` (`1494790764134273195`) should run `copilot/claude-fable-5`, but a real inbound turn started directly on `ollama/qwen3-coder-next-q6k:latest`.

Verified facts:

- Exact session key: `agent:main:discord:channel:1494790764134273195`.
- Persistent profile is already correct:
  `channels.runtimeByChannel.discord.1494790764134273195.model = copilot/claude-fable-5`.
- The same profile sets thinking `high`, reasoning `on`, and text verbosity `low`.
- Global default must remain unchanged.
- Git/config backup history shows Einstein previously used `openai/gpt-5.6-sol`, then was changed to Fable 5. No channel config backup sets Einstein to Ollama.
- Session `a6eaa5bb-58de-46da-b30e-eb3597c533cb`, run `5a177466-72bf-467a-a429-99f1c530b2ac`, began with `provider=ollama`, `model=qwen3-coder-next-q6k:latest`. There is no observed Fable/Opus failure or fallback event before that start.
- `sessions.patch` can temporarily align the stored session, but the next inbound run can discard that alignment and start on Ollama again.
- Mission Control only reflects Gateway state; it is not the writer.

## Goal

Find the concrete message-time resolver/writer that supplies Ollama to the Einstein inbound run despite the valid channel runtime profile, then make the smallest tested code change so the explicit same-channel `runtimeByChannel` profile reaches the run execution boundary and remains authoritative for new or reconstructed sessions.

Do not solve unrelated model-selection architecture.

## Bounded investigation

Start with these files only:

1. `src/auto-reply/reply/get-reply.ts`
2. `src/auto-reply/reply/get-reply-directives.ts`
3. `src/auto-reply/reply/model-selection.ts`
4. `src/auto-reply/reply/agent-runner.ts`
5. `src/channels/model-overrides.ts`
6. `src/auto-reply/reply/get-reply.fast-path.test.ts`
7. `src/channels/model-overrides.test.ts`

Trace one call chain:

Discord inbound context (`channel=discord`, conversation/group identity for `1494790764134273195`)
→ `resolveChannelRuntimeProfile`
→ `createModelSelectionState`
→ run parameters passed to the agent runner
→ session runtime fields persisted after the run.

At each seam, record the expected and actual provider/model. Identify the first seam where Fable 5 is absent or overwritten. Inspect additional files only when this trace names a direct callee that cannot be understood from the bounded set.

Do not launch broad repository searches or parallel exploratory subagents. Do not spend time re-reading general model documentation already summarized above.

## Characterization-first requirements

Before production changes, add or tighten a focused test reproducing an Einstein-shaped Discord inbound turn:

- config contains `runtimeByChannel.discord.1494790764134273195.model = copilot/claude-fable-5`;
- an existing or reconstructed session contains stale/unrelated runtime model data such as Ollama;
- the actual run invocation receives `copilot/claude-fable-5`;
- the persisted post-run session agrees with the selected runtime model;
- no implicit fallback is fabricated.

Also pin unchanged behavior for:

- a Discord channel without a runtime profile uses the existing global/default path;
- an explicit same-session `/model` override retains its documented precedence;
- an unrelated `agent:main:current` or requester session cannot affect Einstein.

## Implementation boundary

Make the smallest change at the proven broken seam. Likely fixes must be justified by the failing characterization test; do not assume channel identity mismatch or stale session precedence without evidence.

Preserve:

- global default behavior;
- channels without explicit runtime profiles;
- explicit same-session `/model` semantics;
- normal provider fallback behavior after a genuine provider/model failure;
- schema-safe model allowlist entries.

Add bounded provenance for the selected model source if the current trace cannot distinguish `channel-runtime-profile`, `explicit-session-override`, `explicit-model-command`, `session-hydration`, and `global-default`. Do not log prompts or secrets.

If the first writer cannot be proven, stop with tests/provenance instrumentation and a sharply bounded RCA. Do not apply a speculative shared resolver rewrite.

## Gateway safety boundary

This task is code, tests, and RCA only. It must not:

- edit live `~/.openclaw/openclaw.json`;
- patch/reset the production Einstein session;
- perform the live channel switch;
- install or link a build;
- deploy;
- restart or stop the live Gateway.

Jackie will review accepted evidence and perform any later install/restart/live verification as a separate operator action.

## Acceptance

- A focused regression test fails before and passes after the change.
- A real Einstein-shaped inbound execution selects `copilot/claude-fable-5` at run start.
- Existing/reconstructed stale Ollama session state cannot silently override the explicit channel profile.
- Unprofiled/default channels retain existing behavior.
- Explicit same-session overrides retain documented precedence.
- The final note names the first broken seam/writer, changed files, focused test commands/results, broader typecheck/build result, remaining risk, and rollback boundary.

## Verification

Run the smallest focused tests for the touched resolver and inbound execution path, then the relevant typecheck/build gate. Include explicit test evidence for both Einstein-shaped and unrelated/default channel cases. Do not treat build success alone as acceptance.
