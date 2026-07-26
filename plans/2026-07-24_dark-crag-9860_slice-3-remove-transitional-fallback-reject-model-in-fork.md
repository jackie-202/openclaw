# Plan 2026-07-24: Complete Slice 3 acceptance evidence

Supply the missing canonical-gate result and durable final note without reopening the preserved implementation.

*Status: DRAFT*

## Analysis

- `src/channels/model-overrides.ts` already reads models only from `modelByChannel`; `src/config/zod-schema.channels-config.ts` already rejects runtime-profile `model` with the required migration message.
- `plans/checkpoints/dark-dune-1632.red-green-proof.md` contains the genuine parent RED/GREEN. The follow-up must link it and capture fresh GREEN, not fabricate another RED.
- `plans/checkpoints/acceptance-runs/dark-dune-1632-acceptance-001/result.json` identifies only two missing deliverables: a non-`not-run` caller-owned canonical Test Gate result and a final task note.
- The recorded before-state is 10 files with 13,585 insertions and 4,887 deletions. The current after-state reproduces 11 files with 13,560 insertions and 4,950 deletions when the discovered pricing-cache surface is included, a net reduction of 88 lines.
- Preserve all unrelated dirty-worktree changes; no `src/` or existing parent artifact change is expected.

## Knowledge Base

- `learnings/tooling/2026-07-24_standalone-green-is-not-a-new-tdd-cycle.md`: link historical RED/GREEN and record fresh verification separately.
- `learnings/tooling/2026-07-24_acceptance-retries-need-inspectable-parent-diffs.md`: acceptance artifacts must expose exact evidence and gaps rather than rely on unsupported completion claims.
- `learnings/architecture/dark-dune-1632-model-free-runtime-profile-boundary.md`: retain separate type and rejection-only validation boundaries.
- Knowledge search used the local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `task-evidence`: extract exact parent commands/outcomes without reconstructing history.
- `acceptance`: ensure the current evidence artifacts directly answer both blocking findings.
- `save-learning`: persist the evidence-delivery lesson as the final execution action.

## Implementation

1. Reinspect the preserved Slice 3 source/tests and current affected-surface stat. If behavior has regressed, stop and replan; otherwise make no production or test edits.
2. Run `python3 "$HOME/.config/opencode/skills/task-evidence/scripts/fetch-evidence.py" --task dark-dune-1632 --project-dir .`; use only exact command/outcome pairs present in the generated artifact and disclose any unavailable log evidence.
3. Re-run the parent focused command as fresh GREEN: `pnpm test src/channels/model-overrides.test.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts -- --reporter=dot`. Record command, exit code, and test counts in `plans/checkpoints/dark-crag-9860.evidence.md`, linked to `plans/checkpoints/dark-dune-1632.red-green-proof.md` as historical TDD provenance.
4. Submit the preserved workspace through the caller-owned canonical Test Gate workflow. Require a concrete canonical result covering the repository test/build gate; record its reference, commands, outcomes, provider/run ID when supplied, and proof gaps in `plans/checkpoints/dark-crag-9860.evidence.md`. A blocked or `canonical:not-run` result leaves the task incomplete and must not be represented as success.
5. Run `git diff --stat upstream/main -- src/channels/model-overrides.ts src/config/types.channels.ts src/config/zod-schema.channels-config.ts src/config/schema.help.ts src/config/config.plugin-validation.test.ts src/auto-reply/reply/get-reply.fast-path.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/gateway/session-utils.test.ts src/agents/agent-command.live-model-switch.test.ts src/auto-reply/status.test.ts src/gateway/model-pricing-cache.ts`. Create `plans/checkpoints/dark-crag-9860.final-note.md` with the historical before stat, current after stat, net reduction, pricing-cache explanation, and the dispositions below.
6. Create `plans/checkpoints/dark-crag-9860.checkpoint.md` linking the final note, current evidence, parent RED/GREEN, task-evidence artifact, and concrete canonical Test Gate reference as caller-supplied acceptance inputs.
7. Run `git diff --check` for the new task artifacts. Invoke `save-learning` last and perform no subsequent edits or verification.

| Commit | Required final disposition |
| --- | --- |
| `9c09c25952` | Retained narrowly for profile matching and non-model persistence; model ownership replaced by `modelByChannel`. |
| `435059f7d6` | Runtime-profile model authority replaced; supplemental resolver and unrelated behavior retained. |
| `0529559822` | Retained narrowly; stale automatic-fallback pins remain validated against canonical `modelByChannel`. |

## Files to Modify

| File | Change |
| --- | --- |
| `plans/checkpoints/dark-crag-9860.evidence.md` | Record fresh GREEN and the concrete canonical Test Gate result. |
| `plans/checkpoints/dark-crag-9860.final-note.md` | Record before/after diff-stat and all three commit dispositions. |
| `plans/checkpoints/dark-crag-9860.checkpoint.md` | Link every acceptance input under the follow-up task ID. |
| `learnings/**` | Add the required learning through `save-learning` as the final action. |

## TDD: skip

This is an evidence-only repair after implementation; reuse `plans/checkpoints/dark-dune-1632.red-green-proof.md` as the genuine RED/GREEN and capture fresh GREEN without claiming a new TDD cycle.

## Verification

- Focused GREEN passes and is recorded under `dark-crag-9860` with exact counts.
- The caller-owned Test Gate returns a concrete canonical result covering repository test/build, not `canonical:not-run`.
- The final note reports 10 files, 13,585 insertions, and 4,887 deletions before; remeasured current values after; the net change; and all three commit dispositions.
- `git diff --check -- plans/checkpoints/dark-crag-9860.evidence.md plans/checkpoints/dark-crag-9860.final-note.md plans/checkpoints/dark-crag-9860.checkpoint.md` exits 0 before `save-learning` runs.

## Dependencies

- The original `dark-dune-1632` worktree and proof remain intact.
- Completion depends on the caller-owned Test Gate producing an inspectable canonical result; local focused tests alone cannot satisfy finding-001.
