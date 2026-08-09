# Plan 2026-08-09: Close Deliberation Test Gate Evidence Gap

Capture caller-owned passing verification for the preserved Deliberation integration work without changing production behavior.

_Status: DRAFT_
_Created: 2026-08-09_

## Analysis

### Codebase Context

- `plans/checkpoints/acceptance-runs/bold-reef-5266-acceptance-001/result.json` rejects the goal because the caller Test Gate is `not run`; the local aggregate was 103/105.
- `plans/checkpoints/bold-reef-5266.evidence.md` contains truncated historical commands and unavailable outcomes, so it cannot establish canonical GREEN.
- `package.json:1769` owns the cross-repository integration command; `docs/reference/test.md:11` and `docs/reference/test.md:38` route the full plugin selection through `pnpm test extensions/deliberation`.
- The exact external KM pytest selection is absent from preserved evidence and must be read from the KM checkout's maintained test configuration by the canonical runner.

### Relevant Documentation

- `plans/2026-08-09_bold-reef-5266_add-isolated-deliberation-plugin-km-listener-spool.md` already limits the repair to canonical evidence and forbids relabeling local runs.
- `plans/checkpoints/cool-vale-3921.red-green-proof.md` is the genuine historical RED/GREEN implementation proof and remains linked rather than recreated.

### Knowledge Base

- `learnings/tooling/2026-08-02_canonical-gate-evidence-must-belong-to-current-acceptance-run.md`: record run owner/reference, exact command, revision, timestamp, exit code, and named counts.
- `learnings/tooling/bold-reef-5266-preserve-aggregate-exit-status.md`: a focused pass does not make a failing aggregate green.
- `learnings/tooling/bold-reef-5266-external-suite-commands-are-evidence-provenance.md`: do not infer the truncated KM command from its 90-test count.
- Knowledge recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `task-evidence`: extract historical command/outcome pairs without reconstructing missing logs.
- `openclaw-testing`: identify the maintained OpenClaw wrappers and diagnose a canonical failure narrowly.
- `acceptance`: evaluate supplied artifacts and canonical references only; it does not execute tests.
- `tdd`: use only after a canonical failure proves a real implementation defect.
- `save-learning`: mandatory final action after evidence closeout.

## Approach

Use the caller-owned Test Gate as the only new GREEN authority. Keep local implementation logs, the 103/105 aggregate, and the historical RED/GREEN artifact as provenance rather than acceptance proof.

## Execution

1. Re-read the immutable `bold-reef-5266-acceptance-001` manifest/result, parent checkpoint/evidence, historical `cool-vale-3921` RED/GREEN proof, current worktree status, and both checkout revisions. Do not modify or rerun completed implementation work.
2. Obtain an inspectable caller-owned Test Gate tied to `bold-reef-5266`. If its status is absent or `not run`, record the external blocker in `plans/checkpoints/fresh-mist-4969.checkpoint.md` and stop; another local run cannot satisfy the finding.
3. Require the gate to run `pnpm test extensions/deliberation -- --reporter=verbose` and report exit 0 for the full Deliberation selection. A 103/105 result remains failing evidence even if a narrower selection passes.
4. In the same gate, read the KM checkout's scoped instructions and maintained pytest configuration, then execute the exact focused listener/wire/spool selection. Do not reconstruct its command from the historical `90 passed` line. Include `OPENCLAW_DELIBERATION_KM_ROOT=<km-checkout> pnpm test:deliberation:km-integration` as supplemental harness proof when the gate supports both checkouts.
5. Record for every gate entry: caller/run ID and URL or artifact path, exact command, OpenClaw and KM revisions, timestamp, exit code, selected files/cases, and passed/failed/skipped counts. Preserve logs that identify both required surfaces.
6. If a canonical entry fails, classify the exact failing cases against the parent diff and current checkout before editing. Leave infrastructure or unrelated failures blocked; only a canonical failure attributable to the parent implementation permits the smallest test-backed fix via `skill:tdd`, followed by the same caller-owned matrix.
7. Update `plans/checkpoints/fresh-mist-4969.evidence.md` and `plans/checkpoints/fresh-mist-4969.checkpoint.md` with the gate reference, exact outcomes, this plan, `plans/checkpoints/cool-vale-3921.red-green-proof.md`, and an explicit statement that production/test files were unchanged. Link these from `plans/checkpoints/bold-reef-5266.checkpoint.md` without rewriting generated historical evidence.
8. Run `skill:acceptance` only against a caller-supplied retry manifest containing the canonical gate reference; require `goal-001` to finalize as met. Run `git diff --check` on task-owned evidence/state files, then invoke `save-learning` as the final action and save at least one learning.

## Files to Modify

| File                                              | Change                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `plans/checkpoints/fresh-mist-4969.evidence.md`   | Record exact caller-owned gate provenance and outcomes.                                    |
| `plans/checkpoints/fresh-mist-4969.checkpoint.md` | Link this plan, historical proof, gate, acceptance result, and no-code-change disposition. |
| `plans/checkpoints/bold-reef-5266.checkpoint.md`  | Link the follow-up evidence that closes or explicitly blocks the parent finding.           |
| `learnings/**`                                    | Add the mandatory session learning through `save-learning`.                                |

Production and test files remain unchanged unless the canonical gate proves a parent implementation defect.

## TDD: skip

This is an evidence-only follow-up after implementation; reuse `plans/checkpoints/cool-vale-3921.red-green-proof.md` and capture fresh canonical GREEN without fabricating another RED.

## Completion Criteria

- The caller-owned gate is inspectable and tied to `bold-reef-5266`; `not run`, local-only, truncated, or inferred evidence does not qualify.
- The full Deliberation selection and maintained focused KM selection both exit 0 with named counts.
- The checkpoint links the canonical retry result and preserves the aggregate exit status exactly.
- No production or test file changes unless canonical output proves a parent defect.

## Dependencies

- The caller/monitor must supply the canonical Test Gate and retry manifest.
- The canonical runner needs the KM checkout and its maintained test configuration.
