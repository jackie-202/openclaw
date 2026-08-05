# Plan 2026-08-02: Supply canonical Discord deliberation Test Gate evidence

Obtain caller-owned verification for the preserved fix and record its provenance without changing production code.

_Status: DRAFT_

## Analysis

- `plans/checkpoints/fresh-fork-4718.red-green-proof.md` records local GREEN results: 105 Discord tests and a 353-test Deliberation/Discord/shared-dispatch/loader matrix.
- `plans/checkpoints/acceptance-runs/fresh-fork-4718-acceptance-001/result.json` rejects only the missing canonical Test Gate reference (`status:not-run`); local checkpoint output cannot replace it.
- `extensions/discord/src/monitor/message-handler.process.test.ts:564` and `:3851` contain the host-dispatch and loader-backed Deliberation integration coverage. `extensions/deliberation/src/hooks.test.ts:36`, `src/auto-reply/reply/dispatch-from-config.test.ts:6887`, and `src/plugins/source-checkout-runtime.test.ts:12` cover the sibling surfaces.
- The parent implementation remains in the worktree and commit `b734b8e3ee4`; do not revert, repeat, or broaden it unless the canonical gate exposes a real defect.
- `docs/reference/test.md:11` requires repository-wrapped targeted tests; `docs/reference/test.md:21` confirms check gates do not provide Vitest proof.

## Knowledge Base

- `learnings/tooling/evidence-only-tdd-followups-preserve-historical-red.md`: retain the genuine parent RED and capture fresh GREEN without manufacturing a failure.
- `learnings/tooling/2026-08-02-current-run-canonical-gate-provenance.md`: a canonical result must belong to this acceptance attempt and include an inspectable reference, command, exit code, timestamp, and named counts.
- Knowledge recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable; returned architecture learnings did not supersede the directly applicable evidence rules.

## Available Skills

- `openclaw-testing`: select the narrow repository-wrapped test surface and distinguish Vitest proof from check-only gates.
- `task-evidence`: recover historical command/outcome pairs only; preserve reported gaps instead of reconstructing them.
- `acceptance`: evaluate a retry manifest only after the caller supplies a concrete canonical gate reference.
- `save-learning`: persist the gate-provenance lesson as the final execution action.

## Approach

Keep all production and test files unchanged. Submit the preserved workspace to the caller-owned Test Gate, require logs that explicitly prove the existing Deliberation and Discord inbound surfaces, and record the returned canonical reference verbatim.

## Execution Steps

1. Confirm the parent diff and link `plans/checkpoints/fresh-fork-4718.red-green-proof.md` plus `plans/checkpoints/acceptance-runs/fresh-fork-4718-acceptance-001/result.json`; do not rerun historical RED or regenerate parent artifacts.
2. Request a canonical run for:
   `pnpm test extensions/deliberation extensions/discord/src/monitor/message-handler.process.test.ts src/auto-reply/reply/dispatch-from-config.test.ts src/plugins/source-checkout-runtime.test.ts -- --reporter=verbose`
3. If the caller-owned workflow can execute only the registered `cd ~/Projects/openclaw-fork && npm test`, accept it only when its canonical logs identify the required Deliberation, Discord inbound, shared dispatch, and source-checkout tests as passing. Otherwise keep the task blocked and request targeted canonical coverage.
4. Record the canonical provider/run ID or URL, exact command, timestamp, exit code, per-suite counts, aggregate count, and any proof gaps in `plans/checkpoints/cool-reef-2065.evidence.md`. Never label a local run or the parent 353-test checkpoint as the canonical gate.
5. On a passing gate, create `plans/checkpoints/cool-reef-2065.checkpoint.md` linking this plan, the new canonical evidence, the historical RED/GREEN proof, and the rejected parent acceptance result.
6. On a failing gate, first classify infrastructure and unrelated failures as blockers. Change code only when the output demonstrates a defect in the preserved fix; then add the smallest regression, execute `skill:tdd`, and rerun the same canonical gate.
7. If a retry acceptance manifest is supplied, use `acceptance` to verify `goal-001` against the concrete gate reference. Do not finalize acceptance from repository-local evidence alone.
8. Invoke `save-learning`, save at least one learning about current-run canonical gate provenance, and perform no later edits or verification.

## Files to Modify

| File                                             | Change                                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `plans/checkpoints/cool-reef-2065.evidence.md`   | Record the exact caller-owned canonical Test Gate reference and outcomes. |
| `plans/checkpoints/cool-reef-2065.checkpoint.md` | Link the canonical result and preserved parent evidence.                  |

Production and test files remain unchanged unless the canonical gate proves a real implementation defect.

## TDD: skip

This follow-up adds acceptance evidence only; preserve the genuine RED/GREEN cycle in `plans/checkpoints/bright-mist-1370.red-green-proof.md` and do not fabricate a new RED after the fix exists.

## Completion Conditions

- The Test Gate reference is caller-owned, inspectable, tied to `cool-reef-2065`, and no longer `status:not-run`.
- Canonical logs explicitly show the required Deliberation and Discord inbound surfaces green.
- Evidence records exact outcomes and gaps without upgrading local claims to canonical status.
- No production or test code changed unless a canonical failure proved a defect.

## Dependencies

- The caller/monitor must provide the canonical Test Gate workflow and its inspectable result; repository-local execution cannot close `finding-001`.
- The preserved parent implementation and historical proof remain available unchanged.
