# [acceptance-fix] Fix runtimeByChannel not applied when a new Discord channel session starts: Provide a genuine captured RED and subsequent GREEN TDD cycle for the new implem

Auto-created by the monitor because the original task `bold-peak-9726` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- Provide a genuine captured RED and subsequent GREEN TDD cycle for the new implementation.
- [P1] Required GREEN TDD evidence is missing (plans/checkpoints/bold-peak-9726.red-green-proof.md) -> Capture and include a successful GREEN run of the recorded regression command after the implementation changes.

## Context

- Original task: `bold-peak-9726`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-07-13_bold-peak-9726_fix-runtimebychannel-not-applied-when-a-new-discord-channel.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Why incomplete:** The supplied diff appears to implement the requested runtime profile selection and precedence correctly, but acceptance is blocked because the required new-implementation TDD proof includes RED evidence without corresponding GREEN evidence.

**Already done (do NOT redo):**

- Apply `channels.runtimeByChannel` to fresh Discord channel sessions with precedence: session override, runtime profile, legacy channel model, global default.
- Apply channel runtime `thinkingLevel`, `reasoningLevel`, and `textVerbosity` during execution while preserving explicit session precedence.
- Preserve legacy `modelByChannel` behavior as fallback when the runtime profile has no model.

## Recent learnings from previous attempt

### channel-runtime-profile-execution-precedence.md

```
---
title: "Profily runtime kanálu patří do cesty spuštění"
date: 2026-07-13
category: architecture
component: backend
tags: [openclaw, channels, runtime-profile, model-selection, auto-reply]
file_type: decisions
---

# Channel runtime profiles must be resolved at the execution boundary

`channels.runtimeByChannel` is not only display metadata. Inbound execution must resolve one effective profile and carry it through model selection, directive defaults, and provider request parameters.

The effective precedence is:

1. Live session state
2. Persistent channel runtime profile
3. Legacy `modelBy
```

## Implementation session log excerpt (last 50 lines)

```
m parameters through `src/auto-reply/reply/get-reply-run.ts:1321`.
- Runtime-only profiles now work in dispatch and native slash paths.
- Added precedence, restart/fresh-session, dispatch, and propagation regressions.
- RED/GREEN evidence: `plans/checkpoints/bold-peak-9726.red-green-proof.md`.
- Learning saved: `learnings/architecture/channel-runtime-profile-execution-precedence.md`.

Verification:
- Focused tests: 55 passed.
- Runtime-only dispatch regression: passed.
- `pnpm build`: passed.
- Final `.agents/skills/autoreview/scripts/autoreview --mode local`: clean.
- Core lint/typecheck remain blocked by unrelated pre-existing unused `getTrajectoryWindowWriter` at `src/trajectory/runtime.ts:439`.
- Full dispatch suite has two unrelated existing inbound-claim metadata assertion failures.

```

## TDD proof provenance for this acceptance fix

Do not create or fabricate a fake RED after the original implementation exists. Reuse and link the historical genuine RED from the parent or previous proof when applicable, then capture fresh GREEN verification under this follow-up task.
