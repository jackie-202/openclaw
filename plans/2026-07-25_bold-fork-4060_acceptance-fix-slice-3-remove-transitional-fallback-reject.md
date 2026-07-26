# Plan 2026-07-25: Complete Slice 3 acceptance evidence

Supply the missing canonical-gate result and final note without reopening the preserved Slice 3 implementation.

*Status: DRAFT*

## Analysis

- `src/channels/model-overrides.ts:232` resolves models only from `modelByChannel`; `src/config/zod-schema.channels-config.ts:11` rejects runtime-profile `model` with migration guidance.
- Existing regressions cover the single-authority resolver, schema rejection, fresh-session model selection, and supplemental runtime fields in `src/channels/model-overrides.test.ts:268`, `src/config/config.plugin-validation.test.ts:1709`, `src/auto-reply/reply/get-reply.fast-path.test.ts:337`, and `src/gateway/session-utils.test.ts:522`.
- `plans/checkpoints/dark-dune-1632.red-green-proof.md` is the genuine historical RED/GREEN. Do not create another RED or repeat completed source/test work.
- `plans/checkpoints/acceptance-runs/dark-crag-9860-acceptance-001/result.json` leaves only two gaps: a concrete caller-owned canonical Test Gate result and the completed `dark-crag-9860` final note.
- The recorded before-state is 10 files with 13,585 insertions and 4,887 deletions. The current affected-surface command reproduces 11 files with 13,560 insertions and 4,950 deletions; the added surface is `src/gateway/model-pricing-cache.ts`, and net fork delta decreases by 88 lines.

## Knowledge Base

- `learnings/tooling/2026-07-24_standalone-green-is-not-a-new-tdd-cycle.md`: link historical proof; never fabricate a follow-up RED.
- `learnings/tooling/dark-crag-9860-diff-against-the-correct-provenance-baseline.md`: use the recorded parent before-state and the same explicit affected-path set, not an unscoped branch diff.
- `learnings/tooling/dark-crag-9860-use-task-lineage-when-a-checkpoint-is-missing.md`: preserve immutable task, checkpoint, and acceptance-run provenance.
- Knowledge search used local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `openclaw-testing`: identify and record the caller-owned canonical repository gate without substituting focused tests.
- `acceptance`: check the finished artifacts directly against `finding-001` and `finding-002`.
- `save-learning`: persist at least one session learning as the final action.

## Implementation

1. Reconfirm the four source/test seams above are still present. If they drifted, stop and replan; otherwise make no `src/` or test edits.
2. Submit the preserved workspace to the caller-owned Test Gate workflow using the registered repository context (`testCommand: cd ~/Projects/openclaw-fork && npm test`). Capture the concrete gate reference, exact commands actually executed, repository test/build coverage, outcome, and provider/run ID. A blocked or `canonical:not-run` result keeps the task incomplete; no local focused run substitutes for this gate.
3. Create `plans/checkpoints/dark-crag-9860.final-note.md`. Link the historical RED/GREEN proof and concrete Test Gate result; include the exact affected-path diff-stat command/output, the recorded before-state, the remeasured after-state, the 88-line net reduction, and why `src/gateway/model-pricing-cache.ts` expands the surface from 10 to 11 files.
4. Record these dispositions in that final note: `9c09c25952` retained narrowly for profile matching/non-model persistence with model ownership replaced by `modelByChannel`; `435059f7d6` model authority replaced while supplemental resolver/unrelated behavior remains; `0529559822` retained narrowly with stale fallback pins validated against canonical `modelByChannel`.
5. Update `plans/checkpoints/dark-crag-9860.checkpoint.md` to mark the canonical gate and final note complete. Create `plans/checkpoints/bold-fork-4060.checkpoint.md` linking this plan, the parent final note, historical proof, acceptance result, and Test Gate reference so the repair lineage is inspectable.
6. Use `acceptance` to compare the artifacts with both blocking findings, then run `git diff --check -- plans/2026-07-25_bold-fork-4060_acceptance-fix-slice-3-remove-transitional-fallback-reject.md plans/checkpoints/dark-crag-9860.final-note.md plans/checkpoints/dark-crag-9860.checkpoint.md plans/checkpoints/bold-fork-4060.checkpoint.md`.
7. Invoke `save-learning`, save at least one learning under `learnings/`, and perform no subsequent edits or verification.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/checkpoints/dark-crag-9860.final-note.md` | Add canonical-gate proof, measured before/after stats, and all three commit dispositions. |
| `plans/checkpoints/dark-crag-9860.checkpoint.md` | Replace incomplete steps with links to completed evidence. |
| `plans/checkpoints/bold-fork-4060.checkpoint.md` | Record the current repair lineage and completion state. |
| `learnings/**` | Add the mandatory session learning through `save-learning`. |

## TDD: skip

This is an evidence-only repair after implementation; reuse `plans/checkpoints/dark-dune-1632.red-green-proof.md` and do not claim a new TDD cycle.

## Verification

- The caller-owned Test Gate has a concrete passing result covering the repository test/build gate, not `canonical:not-run`.
- The final note contains the exact 10-file before and 11-file after measurements, the 88-line net reduction, pricing-cache explanation, and three commit dispositions.
- Both checkpoints link the final note, historical proof, acceptance result, and canonical gate reference.
- `git diff --check` exits 0 before `save-learning` runs last.
