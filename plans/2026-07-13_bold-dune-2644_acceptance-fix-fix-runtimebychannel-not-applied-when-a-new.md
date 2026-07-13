# Plan 2026-07-13: Complete runtimeByChannel acceptance evidence

Complete only the missing acceptance-check and final learning evidence for the preserved Discord runtime-profile fix.

_Status: DRAFT_
_Created: 2026-07-13_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `plans/checkpoints/calm-reef-1872.red-green-proof.md` already links the genuine parent RED and captures two successful 55-test GREEN runs.
- `plans/checkpoints/calm-reef-1872.checkpoint.md` says acceptance passed, but no persisted acceptance-check state/result exists.
- The preserved source and regression-test worktree changes are out of scope; the task explicitly forbids repeating them.

### Relevant Documentation

- No product or architecture docs change; this follow-up only persists task acceptance evidence and a learning.
- `acceptance-checks` defines a stateful `list -> select -> record -> finalize` workflow whose final JSON is persisted in the selected state file.

### Knowledge Base

- `learnings/tooling/acceptance-followups-reuse-historical-red-evidence.md` forbids manufacturing another RED after implementation; acceptance should evaluate the existing parent-linked proof.
- QMD had no `openclaw-fork-learnings` collection, so exact repository search was used as the required fallback.
- A prior learning exists, but this task explicitly requires a new evidence-repair learning saved as the final implementation-session action.

## Available Skills

- `acceptance-checks`: create and finalize the missing structured gate result.
- `save-learning`: persist the evidence-repair lesson last.

## Solution

Persist a task-scoped acceptance state that evaluates the existing RED/GREEN evidence without rerunning or altering implementation tests. Record why non-applicable checks are skipped, finalize a passing TDD verdict, link this plan from task state, then save a new learning about persisted acceptance evidence as the last action.

## Implementation

1. Create `plans/checkpoints/bold-dune-2644.acceptance.json` with `task_id` and `plan` fields linking this plan; preserve those fields while the acceptance CLI adds its state.
2. Create `plans/checkpoints/bold-dune-2644.checkpoint.md` linking this plan, `plans/checkpoints/calm-reef-1872.red-green-proof.md`, and the task-scoped acceptance JSON.
3. From the repository root, run `python3 "$HOME/.config/opencode/skills/acceptance-checks/acceptance_checks.py" list --state-file plans/checkpoints/bold-dune-2644.acceptance.json`.
4. Run `select` with `tdd` relevant; skip `architecture` because this acceptance repair makes no code or boundary change, and skip `security` because it handles no authentication, secrets, user input, or external data.
5. Record `tdd=pass` with evidence citing the parent RED metadata at `plans/checkpoints/bold-peak-9726.red-green-proof.md:3`, historical failures and fresh GREEN results in `plans/checkpoints/calm-reef-1872.red-green-proof.md:3`, and the identical command at `plans/checkpoints/calm-reef-1872.red-green-proof.md:25`.
6. Run `finalize`; require persisted `result.status: finalized`, `result.overall: pass`, selected `tdd`, no remaining checks, and explicit skip reasons. If finalization is incomplete or failing, repair the acceptance selection/evidence rather than changing production code or replaying RED/GREEN.
7. Update `plans/checkpoints/bold-dune-2644.checkpoint.md` to mark acceptance complete before the final learning action.
8. Prepare a concise learning explaining that console claims such as "acceptance passed" are insufficient unless the finalized structured state is persisted and linked from task state.
9. Invoke `save-learning` to write `learnings/tooling/acceptance-results-require-persisted-state.md`; make its successful save command the final implementation-session action, with no later tool calls.

## Files to Modify

| File                                                              | Change                                                                                             |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `plans/checkpoints/bold-dune-2644.acceptance.json`                | Persist task/plan linkage, selected/skipped checks, evidence verdict, and finalized result.        |
| `plans/checkpoints/bold-dune-2644.checkpoint.md`                  | Link the canonical plan and acceptance evidence; record completion before the final learning save. |
| `learnings/tooling/acceptance-results-require-persisted-state.md` | Record the evidence-repair rule through `save-learning` as the final action.                       |

Do not modify the preserved runtime implementation, regression tests, parent proof, original plan, or `plans/tasks/` files.

## TDD: skip

This follow-up adds no behavior: its required RED/GREEN cycle is already genuinely captured in `plans/checkpoints/calm-reef-1872.red-green-proof.md`, and replaying RED after implementation would fabricate provenance.

## Dependencies

- Use the `acceptance-checks` CLI workflow exactly: `list`, `select`, `record`, `finalize` against one state file.
- Treat `plans/checkpoints/calm-reef-1872.red-green-proof.md` as immutable evidence; no fresh test run is required by this follow-up.
- Use the `save-learning` helper with a workspace `tmp/` content file and `--output`; the helper invocation must remain the last action.
