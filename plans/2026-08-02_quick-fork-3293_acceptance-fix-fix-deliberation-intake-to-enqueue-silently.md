# Plan 2026-08-02: Supply canonical fail-closed guard evidence

Obtain the missing caller-owned Test Gate result without changing the accepted implementation.

_Status: DRAFT_
_Created: 2026-08-02_

## Analysis

- `extensions/deliberation/src/intake.ts:86` returns `{ handled: true }` only after successful KM intake; failure returns `{ handled: false }` while the independent dispatch guard preserves source silence.
- `extensions/deliberation/src/hooks.test.ts:204` through `extensions/deliberation/src/hooks.test.ts:346` covers disabled, processing, unmatched, malformed, KM-failure, silence, restricted-send, and disabled-work guards.
- `plans/checkpoints/dark-mist-9990.checkpoint.md` records 16 passing hook tests and broader local verification, but `plans/checkpoints/acceptance-runs/dark-mist-9990-acceptance-001/result.json` rejects it because the caller-owned gate remained `canonical:not-run`.
- `plans/checkpoints/quick-cove-7908.red-green-proof.md` is the genuine historical RED/GREEN artifact; preserve and link it rather than creating a post-implementation RED.
- Knowledge recall used local fallback because `openclaw-fork-learnings` was absent. `learnings/tooling/2026-08-02_evidence-only-followups-need-fresh-direct-gate-outcomes.md` supplies the directly applicable rule: fresh local outcomes do not replace canonical gate provenance.

## Available Skills

- `task-evidence`: retain exact historical outcomes and explicit provenance gaps.
- `acceptance`: evaluate the retry only after a concrete canonical gate reference is supplied.
- `save-learning`: save the mandatory learning as the final execution action.

## Execution Steps

1. Confirm the preserved implementation and tests still match the files and historical proof above; do not edit production or test code when they do.
2. Submit the preserved workspace to the caller-owned canonical Test Gate with targeted coverage for `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`. If the gate instead runs registered command `cd ~/Projects/openclaw-fork && npm test`, require its canonical logs to identify `extensions/deliberation/src/hooks.test.ts` and all 16 tests as passing.
3. Capture the canonical reference, exact command, exit code, timestamp, and named test/file counts. Keep the task blocked for `not-run`, missing/truncated logs, nonzero exit, or output that does not establish the fail-closed cases; do not substitute the existing checkpoint or another self-authored local run.
4. Record the gate facts and links to `dark-mist-9990-acceptance-001`, `dark-mist-9990.checkpoint.md`, and `quick-cove-7908.red-green-proof.md` in `plans/checkpoints/quick-fork-3293.checkpoint.md`.
5. If the canonical test fails, distinguish infrastructure and unrelated failures first. Change code only if the output proves a parent implementation defect; then add the smallest regression and execute the repair through `skill:tdd` before rerunning the same canonical gate.
6. Use `acceptance` against the caller-supplied retry manifest and require `goal-001` to be supported by the new canonical reference.
7. Run `git diff --check -- plans/checkpoints/quick-fork-3293.checkpoint.md`, then invoke `save-learning`, save at least one learning, and perform no later edits or verification.

## Files to Modify

| File                                              | Change                                                                                              |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `plans/checkpoints/quick-fork-3293.checkpoint.md` | Record exact caller-owned gate provenance, outcome, historical proof links, and any remaining gaps. |
| `learnings/**`                                    | Add the mandatory session learning through `save-learning` as the final action.                     |

Production and test files remain unchanged unless the canonical gate proves a real defect.

## TDD: skip

This is an evidence-only follow-up after implementation; reuse `plans/checkpoints/quick-cove-7908.red-green-proof.md` and capture fresh canonical GREEN evidence without fabricating another RED.

## Completion Criteria

- The caller-owned Test Gate reference is concrete and no longer `canonical:not-run`.
- Canonical output establishes all 16 tests in `extensions/deliberation/src/hooks.test.ts` passed, including the existing fail-closed guards.
- The checkpoint preserves exact gate facts and labels unavailable data as a gap.
- No production or test file changes unless a canonical failure proves a defect.

## Dependencies

- The caller/monitor must provide an inspectable canonical Test Gate run; repository-local execution alone cannot close `finding-001`.
- The parent implementation and historical RED/GREEN remain preserved.
