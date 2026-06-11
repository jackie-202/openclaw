# [acceptance-fix] OpenClaw fork: verify issue-grill CLI dispatch path after global-agent dependency fix: Prove the executed `openclaw` CLI resolves to this fork and runs `openclaw --ver

Auto-created by the monitor because the original task `quick-brook-5449` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- Prove the executed `openclaw` CLI resolves to this fork and runs `openclaw --version`.
- Prove `import('global-agent')` succeeds from the fork.
- Run focused OpenClaw checks.
- Run workspace issue-grill dry-run bundle smoke.
- Record durable task evidence if proof is needed.
- Invoke `save-learning` as final action.
- [P1] Missing linked CLI and issue-grill acceptance proof (plans/2026-06-10_quick-brook-5449_openclaw-fork-verify-issue-grill-cli-dispatch-path-after.md) -> Provide passing evidence for the linked fork CLI path, `openclaw --version`, `import('global-agent')`, focused checks, and the workspace dry-run bundle smoke.

## Additional cleanup (suite-wide)

- [P2] Provided test output contains unrelated failing suite results (test/scripts/runtime-postbuild.test.ts:91) -> Investigate separately if this suite was intended to be part of the verification; it does not substitute for the required focused proof.

## Context

- Original task: `quick-brook-5449`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Implement the remaining primary goals above first, then handle any listed cleanup items. The original implementation is committed —
build on it, do not revert or redo completed work.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-06-10_quick-brook-5449_openclaw-fork-verify-issue-grill-cli-dispatch-path-after.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Why incomplete:** Dependency metadata appears corrected, but the task was primarily an acceptance verification. The provided evidence does not prove the linked CLI runtime, direct dependency import, required focused checks, or issue-grill dry-run smoke.

**Already done (do NOT redo):**

- Dependency metadata declares `global-agent` consistently.

## Implementation session log excerpt (last 50 lines)

```
ation command.
[0m$ [0mgit diff --check
(no output)
[0m
`git diff --check` completed with no output, indicating no whitespace errors in the current diff.
[0m⚙ [0mapply_patch Success. Updated the following files:
M plans/checkpoints/quick-brook-5449.checkpoint.md
OpenClaw-local checks passed. I’m moving to the requested safe workspace dry-run smoke, which writes only the specified `/tmp` bundle.
[93m[1m! [0mpermission requested: external_directory (/Users/michal/.openclaw/workspace/*); auto-rejecting
[0m✗ [0mread failed
[91m[1mError: [0mThe user rejected permission to use this specific tool call.
[93m[1m! [0mpermission requested: external_directory (/tmp/*); auto-rejecting
[0m✗ [0mread failed
[91m[1mError: [0mThe user rejected permission to use this specific tool call.

```
