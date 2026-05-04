# [acceptance-fix] [acceptance-fix] Investigation: Opakovaný gateway crash — WhatsApp unhandled rejection (RERUN): Inspect crash logs via bash and collect evidence: Remove unrelated `scripts/bench/` worktree noise only if untracked, or ask befor

Auto-created by the monitor because the original task `fresh-cove-5182` was accepted as done
but did not fully meet all acceptance goals.

## Primary goals (from original task)

- Remove unrelated `scripts/bench/` worktree noise only if untracked, or ask before touching tracked/user-owned changes
- Inspect crash logs via bash and add concrete bash-backed evidence from gateway logs and stability bundle
- Update `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` in place with root cause, source lines, unsafe dereference, 408 path, recommended fix, tests, and upstream status
- Update `plans/checkpoints/wild-reef-6230.checkpoint.md` with acceptance checkpoint evidence
- Preserve investigation-only scope and avoid runtime source edits unless explicitly expanded
- Run lightweight verification appropriate for markdown/checkpoint-only work, at minimum `git diff --check`
- [P1] Required implementation evidence is missing (plans/2026-05-04_fresh-cove-5182_investigation-opakovan-gateway-crash-whatsapp-unhandled.md) -> Provide the actual git diff or file contents for the investigation report, checkpoint, cleanup, and learning artifacts so each plan goal can be verified.
- [P1] Verification did not complete and does not match the planned lightweight proof (plans/2026-05-04_fresh-cove-5182_investigation-opakovan-gateway-crash-whatsapp-unhandled.md) -> Provide completed `git diff --check` output for the markdown/checkpoint-only acceptance fix, or another completed verification result relevant to the changed files.

## Context

- Original task: `fresh-cove-5182`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Implement the remaining primary goals above first, then handle any listed cleanup items. The original implementation is committed —
build on it, do not revert or redo completed work.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-05-04_fresh-cove-5182_investigation-opakovan-gateway-crash-whatsapp-unhandled.md` for full context. Focus only on the unmet goals listed above.

## Previous attempt: acceptance context

**Why incomplete:** Acceptance cannot be granted from the provided evidence. The plan requires concrete investigation/checkpoint artifact updates and lightweight verification, but no diff, no artifact content, no TDD proof context content, and no completed verification output were provided.

## Implementation session log excerpt (last 50 lines)

```
  - 65 matching `gateway.err.log` unhandled rejections
  - representative `dist/server.impl-Bkl7pvfK.js:2051:10` stack
  - May 4 stability bundle evidence
  - upstream `upstream/main` status showing `result.error` still unsafe
- Corrected `plans/checkpoints/wild-reef-6230.checkpoint.md`
- Created and completed `plans/checkpoints/fresh-cove-5182.checkpoint.md`
- Removed unrelated `scripts/bench` files from this task scope
- Saved required learning:
  - `learnings/tooling/acceptance-retry-investigation-reports-need-fresh-evidence.md`

Verification:
- `git diff --check` passed.
- `pnpm test extensions/whatsapp/src/login.coverage.test.ts` was attempted but could not start within 2 minutes because an unrelated local heavy-check lock is held by pid `86846`.

No runtime source changes were made.

```
