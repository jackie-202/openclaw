# Plan 2026-08-25: Verify Deliberation idempotency fix

Supply the missing caller-owned build/test result without repeating activation work or altering the accepted implementation.

_Status: DRAFT_

## Progress

- [x] Phase 0: Initialize canonical plan
- [x] Phase 1: Inspect parent implementation and evidence
- [x] Phase 2: Load relevant knowledge and verification workflows
- [x] Phase 3: Specify the evidence-only execution plan

## Analysis

### Parent state

- `plans/checkpoints/acceptance-runs/warm-cove-0653-acceptance-001/result.json` marks only `goal-003` unmet; every deployment/runtime/non-mutation goal is final.
- `plans/checkpoints/warm-cove-0653.final-note.md` records local focused tests (`97/97`), build, built-singleton smoke, and owner-backed integration (`39/39`) as passing, but no canonical run reference.
- `plans/checkpoints/warm-cove-0653.evidence.md` contains no verification evidence. Historical summaries cannot be promoted to caller-owned gate evidence.
- The workspace contains preserved, uncommitted parent changes. This follow-up must identify the exact synced content rather than relying on `HEAD` alone.

### Canonical verification path

- The registered project gate is `cd ~/Projects/openclaw-fork && npm test`; `package.json:1668` and `docs/reference/test.md:24` define it as full-suite proof.
- Goal-specific canonical entries must also prove `pnpm build`, `pnpm test:build:singleton`, the parent focused Deliberation/Discord command, and `OPENCLAW_DELIBERATION_KM_ROOT=<approved-root> pnpm test:deliberation:km-integration`.
- A pass requires caller-owned provider/run identity, tested-workspace provenance, exact commands, timestamps, exit codes, and complete named totals. Pre-allocation failure or `not-run` remains blocked.

### Knowledge base

- `learnings/tooling/2026-08-20_canonical-test-gate-evidence-cannot-be-reconstructed.md`: do not substitute local output or edit code unless the gate exposes a real regression.
- `learnings/tooling/2026-08-02_canonical-gate-evidence-must-belong-to-current-acceptance-run.md`: broad gate logs must identify the required tests; otherwise coverage cannot be inferred.
- `learnings/tooling/swift-reef-2433-canonical-gate-evidence-needs-run-provenance.md`: preserve provider/run reference and exact source provenance; infrastructure failure is blocked, not pass.
- Knowledge recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; its returned architecture files were not material to this evidence-only retry.

## Available Skills

- `openclaw-testing`: select and interpret the canonical build/test matrix without broad local reruns.
- `task-evidence`: generate exact follow-up session evidence and preserve gaps.
- `acceptance`: consume a caller-supplied retry manifest after concrete Test Gate evidence exists; it does not execute tests.
- `save-learning`: mandatory final execution action.

## Approach

Keep the preserved workspace unchanged and submit its exact content to one caller-owned Test Gate matrix. Accept only durable, non-`not-run` results that explicitly cover the relevant build and Deliberation suites; record infrastructure or test failures without converting them into success.

## Execution Steps

1. Run `skill:task-evidence` for `warm-cove-0653`; inspect `plans/checkpoints/warm-cove-0653.{checkpoint,evidence,final-note}.md`, `plans/checkpoints/acceptance-runs/warm-cove-0653-acceptance-001/result.json`, and `plans/checkpoints/cool-brook-8631.red-green-proof.md`. Preserve the genuine historical RED and all already-met goals.
2. Record the exact candidate state before Test Gate sync: `HEAD`, `git status --short`, and a sanitized digest/manifest of the parent-owned Deliberation source, tests, scripts, and build-smoke file. Do not modify or omit unrelated workspace changes.
3. Submit the registered `cd ~/Projects/openclaw-fork && npm test` command through the caller-owned Test Gate. Require its logs to identify the Deliberation shard; an aggregate pass without relevant suite visibility does not close `goal-003`.
4. In the same canonical gate/run matrix, execute the parent verification commands against the identical synced state:
   - `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/discord/src/outbound-adapter.test.ts -- --reporter=verbose`
   - `pnpm build`
   - `pnpm test:build:singleton`
   - `OPENCLAW_DELIBERATION_KM_ROOT=<approved-km-root> pnpm test:deliberation:km-integration`
5. Capture the gate owner/provider, durable run ID or URL, source-state provenance, exact commands, UTC timestamps, exit codes, complete file/test totals, build result, singleton result, and KM revision/hash provenance. Mark the result `BLOCKED` for no allocation/missing KM prerequisite and `FAIL` for a nonzero command; neither may be reported as acceptance.
6. If a command fails, first separate infrastructure, unrelated-worktree, and task-owned failures. Keep code unchanged unless the canonical output demonstrates a defect in the preserved idempotency fix; only then add the smallest regression/fix via `skill:tdd` and resubmit the same complete canonical matrix.
7. Write `plans/checkpoints/quick-peak-3668.test-gate.md` with the verbatim canonical result. Generate `plans/checkpoints/quick-peak-3668.evidence.md` with `skill:task-evidence`, preserving every unavailable field as a gap.
8. Write `plans/checkpoints/quick-peak-3668.checkpoint.md` and `plans/checkpoints/quick-peak-3668.final-note.md`; link this plan, the canonical gate artifact, parent acceptance result, and `cool-brook-8631.red-green-proof.md`. Mark `goal-003` complete only for a passing non-`not-run` reference.
9. If a caller supplies a retry manifest, use `skill:acceptance` to finalize it and verify that it consumes the new Test Gate reference. Run `git diff --check` on task-owned plan/evidence files, then invoke `skill:save-learning` as the final action and save at least one learning.

## Files to Modify

| Path                                              | Change                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `plans/checkpoints/quick-peak-3668.test-gate.md`  | Record canonical provider/run provenance and PASS/BLOCKED/FAIL outcomes. |
| `plans/checkpoints/quick-peak-3668.evidence.md`   | Store exact task/session evidence and explicit gaps.                     |
| `plans/checkpoints/quick-peak-3668.checkpoint.md` | Link the plan, parent proof, gate artifact, and `goal-003` status.       |
| `plans/checkpoints/quick-peak-3668.final-note.md` | State the final evidence-only verdict and exact verification references. |
| `learnings/**`                                    | Add the mandatory non-duplicative learning through `save-learning`.      |

Production and test files remain unchanged unless the canonical gate proves a task-owned implementation defect.

## TDD: skip

This is an evidence-only retry after implementation; reuse `plans/checkpoints/cool-brook-8631.red-green-proof.md` and capture fresh canonical GREEN evidence instead of fabricating a post-implementation RED.

## Completion Criteria

- A caller-owned Test Gate provides a durable, non-`not-run` reference tied to the exact preserved workspace.
- Canonical output proves the registered test command, focused Deliberation/Discord tests, build, built singleton, and KM integration all exit `0` with complete relevant totals.
- The follow-up links the historical genuine RED, records fresh canonical GREEN, and does not repeat deployment/runtime work.
- Any unavailable runner, prerequisite, or evidence field remains explicitly blocked; local summaries are never relabeled canonical.
- `save-learning` creates at least one learning as the final execution action.
