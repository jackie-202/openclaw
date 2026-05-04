# Plan 2026-05-04: WhatsApp 408 Crash Investigation Acceptance Fix

Close the acceptance gaps by replacing unrelated diff with the required bash-backed investigation evidence, report, checkpoint, and learning artifact.

_Status: DRAFT_

## Problem

The accepted prior task left the required `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` and `plans/checkpoints/wild-reef-6230.checkpoint.md` incomplete for acceptance: bash log evidence was missing, upstream status was not sufficiently proven, and unrelated `scripts/bench/` changes are still in the worktree.

## Analysis

### Context From Codebase

- `extensions/whatsapp/src/login.ts:60` and `extensions/whatsapp/src/login.ts:65` are the only production `result.error` dereferences under `extensions/whatsapp/src/`.
- `extensions/whatsapp/src/session.ts:305` to `extensions/whatsapp/src/session.ts:320` rejects `waitForWaConnection(...)` from `connection.update.lastDisconnect` when Baileys closes with 408.
- `extensions/whatsapp/src/connection-controller.ts:195` to `extensions/whatsapp/src/connection-controller.ts:233` maps non-401/non-515 disconnects, including 408, to a failed login outcome.
- `extensions/whatsapp/src/inbound/monitor.ts:776` and `extensions/whatsapp/src/connection-controller.ts:450` to `extensions/whatsapp/src/connection-controller.ts:490` are the reconnect path; do not redo this trace except to cite it.
- Current required artifacts already exist as untracked files; inspect and revise them instead of creating alternate files.

### Relevant Documentation

- `docs/plugins/sdk-channel-turn.md` confirms plugin-owned channel lifecycle and error handling should stay plugin-local unless using generic runtime seams.
- `extensions/AGENTS.md` requires bundled plugin production code to stay within plugin/SDK boundaries; this investigation should recommend a WhatsApp-local guard, not a core migration.

### Knowledge Base

- `learnings/tooling/investigation-plan-report-output-separation.md`: plan file and final investigation report are separate outputs; write the report under `plans/investigations/`.
- `learnings/tooling/investigation-plan-report-path-precedence.md`: never write investigation reports to `plans/tasks/` or invent alternate destinations.
- `learnings/tooling/source-only-bundled-plugin-crash-investigations.md`: source-only trace is valid, but this acceptance retry explicitly requires bash crash-log inspection too.
- `learnings/runtime-errors/fresh-mist-4301-baileys-408-login-failures-surface-through-a-structured-disconnect-path.md`: 408 path is `lastDisconnect` -> `waitForWaConnection` rejection -> login outcome -> final throw.
- `learnings/patterns/fresh-mist-4301-upstream-history-may-contain-adjacent-fixes-without-covering-the-actual-crash-si.md`: verify upstream source after checking nearby commits; do not assume adjacent QR/output fixes fixed this crash.
- `learnings/tooling/fresh-mist-4301-diagnostic-only-investigations-can-use-lightweight-verification-when-no-runtime-.md`: for markdown/checkpoint-only work, `git diff --check` is the baseline verification.

## Available Skills

- `compound-plan`: already used for this plan; keep plan/report paths separate.
- `save-learning`: run after completing the investigation artifacts and cleanup.
- `openclaw-testing`: use only if the implementer decides to add or run runtime guard tests beyond this diagnostic acceptance fix.

## Solutions

Use the existing partial investigation as the base, then add the missing acceptance evidence and remove unrelated worktree noise. Do not edit runtime source in this acceptance-fix pass unless the task is explicitly expanded from investigation to implementation.

## Implementation

1. Inspect current worktree with `git status --short` and identify unrelated `scripts/bench/` changes; remove only those unrelated benchmark files if they are untracked, or ask before touching tracked/user-owned changes.
2. Inspect crash logs via bash only, because `~/.openclaw/` is outside repo tool access:
   - `grep 'Cannot read properties of undefined' ~/.openclaw/logs/gateway.err.log`
   - `grep -n '408\|Request Time-out\|lastDisconnect\|connection.update' ~/.openclaw/logs/gateway.err.log`
   - `ls -lt ~/.openclaw/logs/stability/openclaw-stability-2026-05-04*`
   - For the most relevant stability bundle, use `python3 -m json.tool < "$BUNDLE"` or a short Python JSON extractor; redact secrets and local-only identifiers in copied evidence.
3. Update `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` in place with these concrete sections:
   - root cause with exact source lines and unsafe dereference
   - bash log evidence with command names, timestamps/frequency, crash stack, and stability bundle facts
   - 408 explanation through Baileys `lastDisconnect` and login outcome mapping
   - recommended fix with exact guarded code shape and affected test file
   - upstream status proven by `git log upstream/main -- extensions/whatsapp/` and direct source inspection on `upstream/main:extensions/whatsapp/src/login.ts`
   - guard-test recommendation for malformed/missing login outcome and 408 failed outcome
4. Update only `plans/checkpoints/wild-reef-6230.checkpoint.md`; mark bash log inspection, upstream proof, report update, unrelated benchmark cleanup, verification, and learning save.
5. Do not update `plans/checkpoints/fresh-mist-4301.checkpoint.md` for this acceptance fix.
6. Run `git diff --check`; if markdown-only plus untracked artifacts remain, do not run broad gates.
7. Run `save-learning` and save at least one concise learning about the acceptance gap, especially that source-only crash reports are insufficient when the task explicitly asks for bash log evidence.

## Files To Modify

| File                                                                      | Change                                                                                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` | Revise with bash log evidence, upstream proof, root cause, 408 explanation, recommended fix, and guard-test recommendation. |
| `plans/checkpoints/wild-reef-6230.checkpoint.md`                          | Update acceptance-fix progress and last-completed state.                                                                    |
| `learnings/.../*.md`                                                      | Add one learning via `save-learning` after artifacts are complete.                                                          |
| `scripts/bench/`                                                          | Remove unrelated benchmark changes from this task's diff if they are untracked and not user-owned.                          |

## TDD: skip

This is a diagnostic artifact cleanup task; no runtime behavior should be implemented in this pass. Recommend guard tests in the investigation report, but do not add them unless the task scope changes.

## Dependencies

- `upstream/main` must be present locally for direct upstream source checks; if missing, run `git fetch upstream main`.
- Bash access to `~/.openclaw/logs/gateway.err.log` and `~/.openclaw/logs/stability/` is required for acceptance evidence; if logs are absent, document the exact commands and absence.
- Preserve existing user/agent worktree changes not related to this acceptance fix.
