# Make the live Discord deliberation intake fix a committed production artifact

## Problem

The completed task chain `bright-mist-1370 -> fresh-fork-4718 -> cool-reef-2065` reported the live Discord hook-wiring fix complete, and tests/build passed, but all production changes are still uncommitted working-tree edits in `/Users/michal/Projects/openclaw-fork`:

- `extensions/deliberation/src/intake.ts`
- `extensions/discord/src/monitor/message-handler.context.ts`
- `extensions/discord/src/monitor/message-handler.process.ts`
- `src/plugin-sdk/plugin-test-runtime.ts`
- related tests

The running Gateway therefore cannot be trusted to contain the fix. Live proof confirms it does not work: Discord source message `1533532931157655772` (`Tak znova`, 2026-08-02T17:52:22.452Z) received no public reply but never reached the healthy listener. Audit remains `[]` and canonical `state/deliberation-v2/spool.sqlite3` did not change from `2026-08-01 20:33:04`.

This is not another listener lifecycle problem: the launchd listener now reports healthy. The source message is still being blocked by `before_dispatch` without a successful `inbound_claim` intake.

## Required change

1. Inspect and reconcile the existing working-tree changes from the completed task chain; do not discard them.
2. Verify the actual cause and production patch against the evidence in:
   - `plans/checkpoints/bright-mist-1370.evidence.md`
   - `plans/checkpoints/fresh-fork-4718.red-green-proof.md`
   - `plans/checkpoints/cool-reef-2065.evidence.md`
3. Ensure Discord runtime obtains the host-shared reply dispatcher instead of a second lazy-loaded runtime instance and that inbound sender identity falls back to Discord `author.id` when required.
4. Preserve fail-closed silence, listener authorization, and unrelated channel routing.
5. Run the focused red/green tests and build/typecheck gates recorded by the prior task, plus `git diff --check`.
6. Leave the repository with the verified source/test changes as the task's intended file edits so the normal autocommit/deploy lifecycle can produce a durable artifact. Do not merely write another evidence-only note.
7. In the final note, explicitly list production files changed, exact tests/build results, and whether the built runtime artifact contains the fix.

## Acceptance criteria

- The fix is represented in source production files, not only tests/checkpoints.
- Focused Discord/deleberation integration tests prove KM intake is invoked exactly once before terminal silence.
- The production build succeeds and includes the shared runtime/sender-context change.
- A normal downstream deploy can run this committed artifact; no reliance on stale uncommitted worktree state.

## Scope

Work only in `/Users/michal/Projects/openclaw-fork`. Do not change live config, restart Gateway, mutate KM spool, or touch credentials. Do not remove unrelated dirty files. This task performs code reconciliation and verification only; Jackie will handle deployment/runtime verification separately.
