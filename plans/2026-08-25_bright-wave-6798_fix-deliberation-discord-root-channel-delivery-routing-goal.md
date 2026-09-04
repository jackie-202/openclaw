# Plan 2026-08-25: Complete Discord root-routing acceptance evidence

Capture the missing task-scoped GREEN and canonical gate provenance without reopening the accepted routing implementation.

_Status: DRAFT_

## Analysis

- `extensions/deliberation/src/route-match.ts:173-206` already omits delivery `threadId` for Discord roots, retains the authenticated child channel for real Discord threads, and preserves Slack timestamps.
- `extensions/deliberation/src/route-match.test.ts:64-225` already covers the production-shaped root failure, real threads, message-ID exclusion, Slack routing, and fail-closed cases.
- `plans/checkpoints/dark-vale-4951.red-green-proof.md` now contains genuine RED and GREEN output for `pnpm test extensions/deliberation/src/route-match.test.ts -- --reporter=verbose`; preserve it unchanged and cite its timestamps, exit codes, totals, and failure reason.
- `plans/checkpoints/acceptance-runs/dark-vale-4951-acceptance-001/result.json` rejected the supplied evidence because its snapshot did not consume GREEN and had `status:not-run; evidence:none` for Test Gate.
- The candidate is a dirty preserved workspace with concurrent changes. Bind every run to `HEAD`, `git status --short`, and task-relevant file digests; do not revert or omit existing work.

## Knowledge Base

- `learnings/tooling/follow-up-proof-must-bind-historical-red-to-fresh-green.md`: link immutable historical RED, run fresh identical GREEN, and keep both claims distinct.
- `learnings/architecture/deliberation-delivery-threads-are-not-event-identity.md`: preserve event/source identity while proving root, child-thread, and Slack delivery targets separately.
- `docs/reference/test.md:11-24,37-38,63-72`: use repository wrappers, explicit plugin tests, separate test and check/type lanes, and include build when required.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; returned generic channel learnings added no task-specific requirements.

## Available Skills

- `task-evidence`: regenerate exact command/outcome lineage after verification; preserve unavailable fields as gaps.
- `openclaw-testing`: select repository wrappers and remote broad proof.
- `acceptance`: finalize only a caller-supplied retry manifest after concrete gate evidence exists.
- `save-learning`: final execution action; save at least one provenance learning.

## Approach

Keep production, tests, docs, and the parent proof unchanged. Produce follow-up evidence that links the parent RED/GREEN, records a fresh identical focused pass, and records a caller-owned Test Gate result with an inspectable provider/run reference. A pre-allocation failure or missing reference remains `BLOCKED`, never `PASS`.

## Execution

1. Record candidate provenance before testing: current `HEAD`, complete `git status --short`, and SHA-256 digests for `extensions/deliberation/src/route-match.ts`, `route-match.test.ts`, `hooks.test.ts`, `final-adapter.test.ts`, and `plugin.test.ts`.
2. Verify the parent proof contains both phases and transcribe, without editing it, the RED timestamp/exit `1`/`message-1` assertion and GREEN timestamp/exit `0`/`36 passed` into `plans/checkpoints/bright-wave-6798.evidence.md`.
3. Run the identical focused command fresh: `pnpm test extensions/deliberation/src/route-match.test.ts -- --reporter=verbose`. Record timestamp, exact command, exit code, full totals, and named root/thread/Slack/fail-closed cases as follow-up GREEN evidence.
4. Submit the exact preserved workspace to the caller-owned Test Gate. Require a durable run ID or URL and execute the registered `cd ~/Projects/openclaw-fork && npm test`, then `pnpm test extensions/deliberation`, `pnpm tsgo:extensions`, `pnpm tsgo:extensions:test`, and `pnpm build` as explicit matrix entries.
5. Write `plans/checkpoints/bright-wave-6798.test-gate.md` with provider, run reference, candidate provenance, UTC timestamps, exact commands, exit codes, and complete totals. Mark `PASS` only if every matrix entry succeeds; otherwise record `FAIL` or `BLOCKED` verbatim.
6. Run `skill:task-evidence` for `bright-wave-6798`; link its generated command/outcome artifact, parent proof, parent acceptance result, and Test Gate artifact from `plans/checkpoints/bright-wave-6798.checkpoint.md` and `plans/checkpoints/bright-wave-6798.final-note.md`.
7. If a retry acceptance manifest is supplied, use `skill:acceptance` and confirm it consumes the concrete Test Gate reference. Do not fabricate or mutate acceptance-run JSON.
8. Run `git diff --check` over the new evidence files. Invoke `skill:save-learning` last and save at least one learning about acceptance-proof provenance.
9. Escalate to code changes only if fresh focused or canonical runs expose a reproducible defect. In that case, stop the evidence-only path, document the failure, and plan the smallest test-first repair without altering unrelated work.

## Files to Modify

| File                                                          | Change                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `plans/checkpoints/bright-wave-6798.evidence.md`              | Bind parent RED/GREEN to fresh focused GREEN and exact provenance. |
| `plans/checkpoints/bright-wave-6798.test-gate.md`             | Record the caller-owned matrix result or exact allocation blocker. |
| `plans/checkpoints/bright-wave-6798.checkpoint.md`            | Link findings, proof, gate, and completion/blocker state.          |
| `plans/checkpoints/bright-wave-6798.final-note.md`            | Map evidence to goals 001-006 without overstating acceptance.      |
| `learnings/tooling/<dated>-acceptance-evidence-provenance.md` | Record the mandatory session learning.                             |

Production, test, documentation, and parent proof files are not modified by default.

## TDD: skip

This is an evidence-only follow-up after implementation: do not manufacture a new RED; reuse the genuine parent RED and capture fresh identical GREEN verification.

## Completion Gate

- Parent RED and GREEN are cited with exact immutable provenance.
- Fresh focused GREEN proves Discord root, real-thread, message-ID exclusion, Slack, and fail-closed behavior.
- Canonical Test Gate has a non-`not-run` durable reference covering full tests, Deliberation tests, extension source/test types, and build.
- Any unavailable runner or failed command is recorded as a blocker, not rewritten as success.
- `skill:save-learning` is the final action.
