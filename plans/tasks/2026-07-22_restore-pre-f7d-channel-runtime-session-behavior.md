# Restore pre-f7d channel runtime session behavior without reverting unrelated runtime-profile support

## Context

A shared Discord session used by both Ask Jackie and Issue Grill regressed after the channel runtime-profile changes landed. The affected session key is:

- `agent:main:discord:channel:1510566522190303313`

Observed symptoms:

- Ask Jackie request `b1bb3b3f-d241-4319-afc6-d54a7591919b` reached `dispatch_accepted` but was lost when session `f51a04f1-8fb0-407a-9d81-961a4dba7ba6` rolled over; the request remains `pending`, finding `f0994` has `taskId: null`, and `start-tech-debt-task.py` never ran.
- The same Discord session is used by Issue Grill. It recorded context-overflow failures on 2026-07-21 at 19:08:25 and 21:53:28 with `compactionAttempts=0`, so the common session lifecycle path is affected rather than only the Ask Jackie result sink.
- Commit `f7d039a3575cc6a563e02bdcfd29793a9cc6fec6` (`fix: apply channel runtime profiles on fresh sessions`) is the leading regression boundary. It changed the fresh-session and reply execution path to apply `channels.runtimeByChannel` model/thinking/reasoning/text verbosity. Later commits `0529559822f1bfb008b329dcdb31b00e70192cb5` and `435059f7d634a3300dd7533b707e8ccfe73008e0` overlap parts of the same code, so a blind `git revert f7d039a...` is unsafe and out of scope.

## Objective

Restore the shared Discord session lifecycle semantics that existed immediately before `f7d039a3575cc6a563e02bdcfd29793a9cc6fec6`, specifically for fresh-session bootstrap, reset/rollover, queued follow-up processing, and context-overflow recovery, while preserving unrelated runtime-profile capabilities that are demonstrably safe.

The implementation must be evidence-led: first reproduce and pin the regression, then apply the smallest semantic rollback. Do not assume every hunk in `f7d039a...` caused the problem.

## Scope

### Characterization-first guardrail

1. Build a focused regression test around one durable message dispatched to a named Discord channel session using a `channels.runtimeByChannel` entry.
2. Cover all of these transitions:
   - existing session receives and completes a dispatched turn;
   - fresh session receives and completes the first dispatched turn;
   - `/new` or equivalent rollover archives the old transcript and the accepted turn is either completed or explicitly retried, never silently abandoned;
   - context overflow during a tool loop invokes the established compaction/retry path or returns an explicit terminal failure; it must not leave an accepted run with no terminal outcome;
   - a queued follow-up preserves its execution parameters across the same transitions.
3. Add a control case without `runtimeByChannel` so the test identifies profile-induced behavior rather than generic session failure.
4. Where practical, run the characterization against the parent of `f7d039a...` and current HEAD to prove the behavioral boundary. Save concise RED/GREEN evidence in the task checkpoint/final note.

### Production change

Inspect and narrowly correct the behavior introduced by `f7d039a...` in these seams:

- `src/auto-reply/reply/get-reply.ts`
- `src/auto-reply/reply/get-reply-directives.ts`
- `src/auto-reply/reply/get-reply-native-slash-fast-path.ts`
- `src/auto-reply/reply/get-reply-run.ts`
- `src/auto-reply/reply/agent-runner-run-params.ts`
- `src/auto-reply/reply/queue/types.ts`
- `src/agents/command/shared-types.ts`
- `src/channels/model-overrides.ts`
- adjacent focused tests only

Preferred correction: restore pre-`f7d039a...` session/bootstrap and retry semantics at the narrow point where runtime profile data changes run construction or recovery. Preserve channel model selection when it does not alter session ownership or recovery. If `thinkingLevel`, `reasoningLevel`, or `textVerbosity` propagation is the trigger, remove or defer only that propagation from fresh/reset/retry paths rather than deleting the whole profile resolver.

Account for follow-up changes:

- `0529559822f1bfb008b329dcdb31b00e70192cb5` changed stale channel model fallback pins in `get-reply.ts`.
- `435059f7d634a3300dd7533b707e8ccfe73008e0` removed legacy channel model overrides in `dispatch-from-config.ts` and `model-overrides.ts`.

Do not resurrect removed legacy model-override plumbing merely to imitate the old diff. Restore behavior, not obsolete architecture.

## Explicit non-goals

- Do not redesign Ask Jackie as a new durable queue/state machine in this task.
- Do not modify Mission Control Ask Jackie files or KM System Issue Grill workflow files unless a test fixture is strictly required to validate OpenClaw behavior.
- Do not change Discord channel IDs, runtime profile configuration, model allowlists, prompts, result-sink ownership, or task creation scripts.
- Do not perform a broad revert of all 46 files in `f7d039a...`; learning, plan, checkpoint, and unrelated test artifacts from that commit remain untouched.
- Do not add git operations to the implementation procedure.

## Acceptance criteria

1. A focused test fails on the current regressed behavior and passes after the correction.
2. A first turn dispatched to `agent:main:discord:channel:1510566522190303313` semantics cannot disappear after acceptance because of fresh-session initialization, `/new`/reset rollover, or context overflow.
3. Context overflow exercises compaction/retry or produces an explicit terminal failure; no accepted run remains silently pending.
4. Existing-session, fresh-session, native slash fast path, normal reply path, and queued follow-up tests retain consistent model/session precedence.
5. Runtime-profile model selection still works for unaffected channel turns. Any intentionally removed support for channel-scoped thinking/reasoning/text verbosity is documented with evidence tying it to the regression.
6. No legacy `channels.modelByChannel` plumbing removed by `435059f7d6...` is reintroduced.
7. Focused suites for `get-reply`, channel runtime/model overrides, queue/follow-up propagation, session reset/rollover, and context-overflow recovery pass.
8. The repository's standard build/typecheck and smallest relevant broader test gate pass. Unrelated failures must be identified with evidence rather than hidden.
9. Final note names the exact causal hunk(s), explains why the rollback is narrower than reverting the full commit, and records test commands/results.

## Verification guidance

At minimum, run the focused tests covering:

- `get-reply.fast-path`
- `get-reply-directives`
- `dispatch-from-config`
- `channels/model-overrides`
- queued follow-up parameter propagation
- session reset/rollover
- context-overflow compaction/retry

Then run the project-standard typecheck/build and the smallest relevant broader test suite. Preserve existing public imports and configuration schema unless the evidence requires a documented compatibility change.
