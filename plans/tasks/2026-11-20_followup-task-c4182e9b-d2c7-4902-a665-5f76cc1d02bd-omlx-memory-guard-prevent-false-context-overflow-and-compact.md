# [acceptance-fix] oMLX memory guard: prevent false context overflow and compaction: goal-001: oMLX memory guard: prevent false context overflow and compaction

Auto-created by the monitor because the original task `task-fdef5f79-d364-498f-b367-16d4da21977c` was accepted as done
but did not fully meet all acceptance goals.

## Caller-supplied runtime prerequisite — 2026-11-20

The host has resolved the missing interpreter input. For this task's installed TDD proof helper, set `CONSUMER_PYTHON=/opt/homebrew/opt/python@3.15/bin/python3.15`. The host directly verified this absolute executable reports CPython 3.15.0 and imports the helper's standard-library dependencies. This satisfies the original plan's caller-supplied interpreter prerequisite; do not probe private runtime configuration or ask for that path again. Use the installed `skill:tdd` helper at `/Users/michal/.config/opencode/skills/tdd/scripts/proof-capture.py`, with `TASK_ID=task-c4182e9b-d2c7-4902-a665-5f76cc1d02bd` for this task's own genuine RED/GREEN cycle. Preserve the exact focused Node/pnpm test argv across both phases. Python is only the proof-helper runtime; do not migrate OpenClaw's environment, change its Python pin, create a venv, install project Python dependencies, or alter instructions/configuration. The original task and its rejected/missing proof remain historical evidence, not this task's proof.

## Primary goals (from original task)

- goal-001: oMLX memory guard: prevent false context overflow and compaction

### [BLOCKING] finding-001 - required_implementation_missing / correctness

**Scope:** `goal-001`  
**Claim:** The required oMLX memory-admission classification and diagnostic repair has not been delivered.

**Observed**
The supplied implementation checkpoint explicitly states that work stopped before tests and production edits, with no source or documentation changes. The complete supplied task diff contains only the Python version pin.

**Why this matters**
The goal requires memory-admission rejections to avoid overflow compaction and schema-error copy while preserving an accurate memory diagnostic. The checkpoint confirms those behavior changes were not implemented; this conclusion is based on its explicit status, not the filtering of workflow artifacts.

**Required action**
Deliver the repository-local classifier, formatter, and recovery-seam repair with the specified admission-versus-abort distinction, positive controls, and bounded compaction documentation.

**Evidence**

- artifact: `plans/checkpoints/task-fdef5f79-d364-498f-b367-16d4da21977c.checkpoint.md`
- file: `plans/tasks/2026-11-20_omlx-memory-guard-not-context-overflow.md`

### [BLOCKING] finding-002 - required_tdd_proof_missing / evidence

**Scope:** `goal-001`  
**Claim:** Caller-required genuine RED/GREEN proof is absent.

**Observed**
The manifest declares tddRequired true, the caller supplies no TDD proof, and the checkpoint explicitly confirms no RED/GREEN proof exists because implementation stopped before tests.

**Why this matters**
The reviewed applicability decision requires exported-classifier and runner-seam regressions to fail before the repair and pass afterward. An interpreter-resolution blocker explains the unfinished cycle but does not satisfy the mandatory proof requirement. This finding concerns declared TDD provenance, not Test Gate execution or suite outcomes.

**Required action**
Resolve the authorized interpreter prerequisite and supply canonical helper-captured accepted_red and accepted_green evidence using identical focused argv, with behavioral RED preceding production edits and GREEN following the repair.

**Evidence**

- artifact: `plans/checkpoints/task-fdef5f79-d364-498f-b367-16d4da21977c.checkpoint.md`
- plan: `plans/2026-11-20_task-fdef5f79-d364-498f-b367-16d4da21977c_omlx-memory-guard-prevent-false-context-overflow-and.md`
- artifact: `manifest.json:tddRequired`

## Context

- Original task: `task-fdef5f79-d364-498f-b367-16d4da21977c`
- Reason: `acceptance_incomplete`
- The original task's code changes are preserved. Continue from that state.

## Instructions

Use the concrete goals and findings above to repair the untrustworthy task outcome. Make the minimum implementation and test changes needed, and verify the repaired behavior.

## Important: do not repeat completed work

The previous attempt partially succeeded. Review what is already committed before making changes. Do NOT revert or redo completed work. If the previous approach caused the failure, try a different approach.

## Original plan

Read the original plan at `/Users/michal/Projects/openclaw-fork/plans/2026-11-20_task-fdef5f79-d364-498f-b367-16d4da21977c_omlx-memory-guard-prevent-false-context-overflow-and.md` for full context. Focus only on the unmet goals listed above.

## Implementation session log excerpt (last 50 lines)

```
] Capture GREEN using the same helper and exact focused command
[ ] Run broader verification and read back canonical RED/GREEN proof
[0m
[0m% [0mPatch 1 file
**Blocked on the required TDD interpreter configuration.** Please provide the authorized **absolute path to the Python 3.15.0 executable** for the proof-capture helper.

I read the authoritative plan and loaded `tdd` and `openclaw-testing`. `.python-version` specifies `3.15.0` but no executable path. Both the plan and TDD skill explicitly require asking for that path rather than probing private runtime state or falling back to PATH/OS Python.

Progress saved in:
`plans/checkpoints/task-fdef5f79-d364-498f-b367-16d4da21977c.checkpoint.md`

No source or test changes made; no verification commands run. RED/GREEN proof remains pending.

```

## TDD proof provenance for this acceptance fix

Inspect the parent implementation and evidence to distinguish actual behavior corrections from already-correct evidence-only work.

- Behavior-changing corrections require genuine focused task-local RED captured with the installed skill:tdd helper before production changes, then matching task-local GREEN using the same exact focused command. The helper supports task-local RED/GREEN only and rejects GREEN without that task's own RED.
- Already-correct evidence-only work must keep original proof/run provenance immutable, reference that evidence under its original task/run identity, execute current verification honestly, and obtain an explicit reviewed TDD applicability/provenance decision through the existing review owners and metadata. Passing current verification is not a newly captured task-local RED/GREEN cycle.

Do not fabricate RED, import historical RED, or copy/relabel another task's proof. Do not automatically downgrade an existing required-TDD decision or waive a gate. If original proof cannot discharge the obligation and the supported helper cannot produce the required proof, report the exact unsupported prerequisite for review rather than prescribing the same unsupported action again.
