# Plan 2026-08-09: Complete Deliberation goal-008 evidence

Capture caller-owned Test Gate proof for the preserved TypeScript and KM suites without reopening the implementation.

_Status: DRAFT_
_Created: 2026-08-09_

## Analysis

- `plans/checkpoints/acceptance-runs/cool-vale-3921-acceptance-001/result.json` marks only `goal-008` unmet because the canonical Test Gate was not run; goals 001-007 are final and must not be repeated.
- `plans/checkpoints/cool-vale-3921.red-green-proof.md` preserves the genuine integration RED and 4-test GREEN. `plans/checkpoints/cool-vale-3921.evidence.md` cannot supply the missing result because its commands are truncated and outcomes unavailable.
- `plans/checkpoints/cool-vale-3921.checkpoint.md` claims 103 passing Deliberation tests and 90 passing KM listener/wire/spool tests, but contains no caller-owned run reference or exact KM command.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` and `package.json` show the parent harness is present; no production or test edit is justified before a canonical failure identifies a task-owned defect.
- `docs/reference/test.md` routes the plugin suite through `pnpm test extensions/deliberation`. The exact focused KM command must come from the KM checkout's maintained test configuration because parent evidence did not preserve it and this planning run could not access that external checkout.

## Knowledge Base

- `learnings/tooling/2026-08-02_canonical-gate-evidence-must-belong-to-current-acceptance-run.md`: preserve the gate reference, command, timestamp, exit code, and named counts; local output cannot be relabeled canonical.
- `learnings/tooling/2026-08-02_evidence-only-followups-need-fresh-direct-gate-outcomes.md`: keep historical RED and capture fresh GREEN only.
- `learnings/architecture/cross-repository-spool-tests-guard-every-constructor.md`: if failure diagnosis reaches the harness, retain its pre-constructor path guards and child-before-filesystem cleanup ordering.
- Knowledge recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was absent.

## Available Skills

- `task-evidence`: preserve exact historical commands and explicit gaps.
- `openclaw-testing`: select the narrow repository wrappers without substituting local proof for the canonical gate.
- `acceptance`: evaluate the retry only after an inspectable gate result exists.
- `tdd`: use only if the gate proves a real implementation defect.
- `save-learning`: record the mandatory final learning.

## Execution

1. Confirm the parent plan, acceptance result, checkpoint, RED/GREEN proof, evidence repair, and current harness are unchanged; record unrelated worktree changes without modifying them.
2. Inspect the KM checkout's scoped instructions and maintained test configuration in the canonical runner. Record the exact focused listener/wire/spool command that owns the previously reported 90 tests; do not infer or invent it from the checkpoint.
3. Submit one caller-owned Test Gate matrix tied to `bold-reef-5266` that runs `pnpm test extensions/deliberation -- --reporter=verbose` and the maintained focused KM listener/wire/spool command. If policy requires the registered `cd ~/Projects/openclaw-fork && npm test`, require its logs to identify the Deliberation suite, and run the focused KM command as a second canonical matrix entry.
4. Require each gate entry to expose its owner/run ID, exact command, checkout revision, timestamp, exit code, test files, and passed/failed/skipped counts. Keep `goal-008` blocked for `not-run`, truncated logs, nonzero exit, omitted suites, or aggregate output that does not identify both surfaces.
5. Write `plans/checkpoints/bold-reef-5266.evidence.md` with the exact gate facts and links to the parent acceptance result and historical RED/GREEN proof. Do not copy the parent checkpoint's prose as new evidence.
6. Write `plans/checkpoints/bold-reef-5266.checkpoint.md` linking this plan, the new evidence artifact, `cool-vale-3921.red-green-proof.md`, and the concrete canonical gate reference; state explicitly that production and test files were unchanged.
7. If a gate fails, classify infrastructure and unrelated dirty-worktree failures first. Modify code only when the canonical output proves a parent implementation defect; add the smallest regression, execute `skill:tdd`, and rerun the same canonical matrix.
8. Run `acceptance` against the caller-supplied retry manifest and require `goal-008` to be supported by the new gate reference. Run `git diff --check` only for task-owned evidence files, then invoke `save-learning` as the final action.

## Files to Modify

| File                                             | Change                                                                       |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| `plans/checkpoints/bold-reef-5266.evidence.md`   | Record exact caller-owned Test Gate provenance and both suite outcomes.      |
| `plans/checkpoints/bold-reef-5266.checkpoint.md` | Link the plan, parent proof, acceptance result, and canonical gate evidence. |
| `learnings/**`                                   | Add the mandatory session learning through `save-learning`.                  |

Production and test files remain unchanged unless the canonical gate proves a real defect.

## TDD: skip

This is an evidence-only follow-up after implementation; reuse `plans/checkpoints/cool-vale-3921.red-green-proof.md` and capture fresh canonical GREEN evidence without fabricating another RED.

## Completion Criteria

- The caller-owned Test Gate reference is concrete and tied to `bold-reef-5266`, not `not-run` or a relabeled local run.
- Canonical logs prove the existing Deliberation TypeScript suite and focused KM listener/wire/spool suite both pass.
- Evidence records exact commands and outcomes; unavailable fields remain explicit gaps.
- No production or test files change unless a canonical failure proves a defect.

## Dependencies

- The caller/monitor must provide an inspectable canonical Test Gate and access to the KM checkout; repository-local prose cannot close `finding-001`.
- The preserved parent implementation and historical RED/GREEN artifact remain the implementation provenance.
