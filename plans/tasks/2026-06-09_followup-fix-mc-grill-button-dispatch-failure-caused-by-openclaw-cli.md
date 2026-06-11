# [acceptance-fix] Fix MC grill button dispatch failure caused by OpenClaw CLI missing dependency / exit handling: Rebuild/verify OpenClaw and prove the linked CLI can load the affected dispatch

Auto-created by the monitor because the original task `warm-cove-7102` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- Rebuild/verify OpenClaw and prove the linked CLI can load the affected dispatch path.
- Harden `mission-control/services/issues.js::runGrillTrigger()` to catch `execFileSync` failures and parse JSON diagnostics from stdout.
- Cover Mission Control grill/issues behavior with existing tests.
- [P1] Mission Control diagnostic handling was not implemented (mission-control/services/issues.js) -> Update `runGrillTrigger()` to catch `execFileSync` non-zero exits, parse JSON diagnostics from `stdout` when present, preserve real non-JSON failures as errors, and add/adjust grill/issues tests.
- [P1] Required acceptance proof is missing and provided test output is failing (plans/checkpoints/warm-cove-7102.red-green-proof.md) -> Provide passing evidence for the plan’s required OpenClaw, grill dry-run, and Mission Control checks after the implementation is complete.
- [P2] Missing TDD proof for testable service changes (plans/checkpoints/warm-cove-7102.red-green-proof.md) -> Add RED to GREEN proof for the grill diagnostics behavior, or document why TDD was skipped if the workflow allows it.

## Context

- Original task: `warm-cove-7102`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Implement the remaining primary goals above first, then handle any listed cleanup items. The original implementation is committed —
build on it, do not revert or redo completed work.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-06-10_warm-cove-7102_fix-mc-grill-button-dispatch-failure-caused-by-openclaw-cli.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Why incomplete:** The OpenClaw dependency fix appears present, but the Mission Control error-reporting fix and required validation evidence are missing. Acceptance is blocked by unmet core plan goals, not by the missing TDD proof alone.

**Already done (do NOT redo):**

- Add `global-agent` to the OpenClaw runtime dependency metadata and lockfiles if the proxy lifecycle import is intentional.

## Implementation session log excerpt (last 50 lines)

```
form 462ms, setup 189ms, import 186ms, tests 408ms, environment 0ms)

[test] passed 2 Vitest shards in 5.33s
[0m
The OpenClaw CLI, dependency import, focused tests, formatting, and whitespace checks all pass after the rebuild. I’m recording that checkpoint and moving to the workspace bundle and Mission Control checks.
[0m⚙ [0mapply_patch Success. Updated the following files:
M plans/checkpoints/warm-cove-7102.checkpoint.md
I’ll run the dry-run bundle generation and bundle reader from the OpenClaw workspace now; these prove prompt/bundle construction without posting externally.
[93m[1m! [0mpermission requested: external_directory (/Users/michal/.openclaw/workspace/*); auto-rejecting
[0m✗ [0mbash failed
[91m[1mError: [0mThe user rejected permission to use this specific tool call.

```

## Previous Plan (rejected - attempt 1)

Plan file: /Users/michal/Projects/openclaw-fork/plans/2026-06-10_dark-brook-6283_fix-mc-grill-button-dispatch-failure-caused-by-openclaw-cli.md
Review feedback: The plan is only a TODO/WIP scaffold and silently omits the required rebuild/verification proof that the linked OpenClaw CLI can load the affected dispatch and handle the exit failure path.
Read the previous plan, understand what was wrong, and produce a corrected plan.
