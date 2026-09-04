# Plan 2026-08-25: Complete canonical Deliberation verification

Obtain the missing caller-owned Test Gate result for the preserved idempotency-key candidate without repeating accepted runtime work.

_Status: DRAFT_

## Analysis

### Parent State

- `plans/checkpoints/acceptance-runs/quick-peak-3668-acceptance-001/result.json` leaves only the canonical build/test evidence goal unmet.
- `plans/checkpoints/quick-peak-3668.test-gate.md` records that Blacksmith, Azure, and AWS failed before allocation; no canonical command started and no durable run ID exists.
- `plans/checkpoints/quick-peak-3668.final-note.md` records non-canonical passes for the focused suite (`97/97`), build, singleton smoke, and KM integration (`39/39`). Do not rerun or relabel these as canonical evidence.
- `plans/checkpoints/cool-brook-8631.red-green-proof.md` is the genuine historical RED/GREEN for the implementation and must remain linked rather than recreated.
- The candidate is a dirty preserved workspace at `c810e68835a`; provenance must describe the synchronized workspace contents, not `HEAD` alone.

### Evidence Contract

- The caller-owned Test Gate must return an inspectable provider/run ID or URL tied to the exact synchronized candidate, exact commands, UTC timestamps, exit codes, and complete named totals.
- The registered gate command is `cd ~/Projects/openclaw-fork && npm test`; `package.json:1668` and `docs/reference/test.md:24` confirm this is full-suite proof.
- `package.json:1438`, `package.json:1671`, and `package.json:1770` define the required build, built-plugin singleton, and KM integration commands.
- A pre-allocation failure remains `BLOCKED`; a started command with a nonzero exit is `FAIL`. Neither closes acceptance.

### Knowledge Base

- `learnings/tooling/2026-08-20_canonical-test-gate-evidence-cannot-be-reconstructed.md`: keep source/tests unchanged unless the canonical gate exposes a real regression.
- `learnings/tooling/2026-08-02_canonical-gate-evidence-must-belong-to-current-acceptance-run.md`: broad logs must identify the required Deliberation tests; aggregate success alone is insufficient.
- `learnings/tooling/swift-reef-2433-canonical-gate-evidence-needs-run-provenance.md`: preserve run identity and candidate provenance; never promote local output.
- `learnings/tooling/quick-peak-3668-canonical-runner-preflight.md`: prove allocation before spending work on the matrix.
- Knowledge recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; returned architecture notes were not material to this evidence-only follow-up.

## Available Skills

- `task-evidence`: refresh exact task-lineage evidence without reconstructing historical runs.
- `openclaw-testing`: interpret the canonical matrix and separate infrastructure, unrelated, and task-owned failures.
- `acceptance`: finalize a caller-supplied retry manifest only after a concrete Test Gate result exists.
- `tdd`: use only if canonical output proves a task-owned implementation defect.
- `save-learning`: mandatory final execution action.

## Execution

1. Run `skill:task-evidence` for `calm-brook-4511`; inspect the parent plan, `plans/checkpoints/quick-peak-3668.{test-gate,evidence,final-note}.md`, the current acceptance result, and `plans/checkpoints/cool-brook-8631.red-green-proof.md`.
2. Record fresh candidate provenance immediately before submission: `HEAD`, `git status --short`, and sanitized hashes for the parent-owned Deliberation source/tests, Discord test, KM script, and singleton smoke script. Preserve all concurrent workspace changes.
3. Submit that exact workspace through the caller-provided Test Gate interface. Require successful runner allocation and a durable run reference before executing or interpreting tests; do not repeat the known unauthenticated provider attempts as a substitute.
4. Execute this matrix in the same caller-owned candidate context:
   - `cd ~/Projects/openclaw-fork && npm test`
   - `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/discord/src/outbound-adapter.test.ts -- --reporter=verbose`
   - `pnpm build`
   - `pnpm test:build:singleton`
   - `OPENCLAW_DELIBERATION_KM_ROOT=<approved-km-root> pnpm test:deliberation:km-integration`
5. Capture provider ownership, run ID/URL, synchronized-state hashes, exact commands, timestamps, exit codes, full suite totals, focused file/test totals, build and singleton outcomes, and KM root revision/hash provenance. Confirm broad logs name the Deliberation coverage.
6. If allocation or the approved KM prerequisite is unavailable, write `BLOCKED` with the exact pre-command failure. If a command starts and fails, use `skill:openclaw-testing` to classify infrastructure, unrelated-workspace, or task-owned failure.
7. Keep production and tests unchanged unless the canonical output proves a task-owned defect. For such a defect only, use `skill:tdd`, add the smallest regression/fix under `extensions/deliberation/`, and rerun the complete canonical matrix against the updated candidate.
8. Write current-task gate, evidence, checkpoint, and final-note artifacts. Link the historical RED/GREEN and parent acceptance result; mark the goal complete only for a passing, non-`not-run` current Test Gate reference.
9. If the caller supplies an acceptance retry manifest, finalize it with `skill:acceptance`. Run `git diff --check` over task-owned evidence files, then invoke `skill:save-learning` as the final action and save at least one non-duplicative learning.

## Files to Modify

| Path                                              | Change                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `plans/checkpoints/calm-brook-4511.test-gate.md`  | Store the current caller-owned run provenance and matrix outcomes. |
| `plans/checkpoints/calm-brook-4511.evidence.md`   | Store exact task-lineage evidence and explicit gaps.               |
| `plans/checkpoints/calm-brook-4511.checkpoint.md` | Link this plan, parent proof, current gate result, and goal state. |
| `plans/checkpoints/calm-brook-4511.final-note.md` | State PASS, FAIL, or BLOCKED without promoting local evidence.     |
| `learnings/**`                                    | Add the mandatory final learning through `save-learning`.          |

Production and test files remain unchanged unless step 7 is triggered by canonical failure evidence.

## TDD: skip

This is an evidence-only follow-up after implementation; reuse `plans/checkpoints/cool-brook-8631.red-green-proof.md` and capture fresh canonical GREEN evidence instead of fabricating a new RED.

## Completion Criteria

- A caller-owned Test Gate provides a durable current-run reference for the exact preserved workspace.
- The registered full suite, focused Deliberation/Discord suite, build, singleton smoke, and KM integration all pass with complete attributable evidence.
- The current artifacts link the genuine historical RED and do not repeat activation, deployment, or resend work.
- Missing allocation, prerequisites, or evidence remain explicitly blocked.
- `save-learning` creates at least one learning as the final execution action.
