# Plan 2026-08-23: Verify the canonical Test Gate

Supply the missing caller-owned Test Gate evidence without changing production behavior.

## Analysis

- `plans/checkpoints/acceptance-runs/cool-reef-8673-acceptance-001/result.json:67-69` marks only `goal-008` unmet; goals 001-007 are complete.
- `plans/checkpoints/cool-reef-8673.red-green-proof.md:82-92` already proves the package test, 58 focused tests, build, tarball integrity, lint, format, and autoreview. Do not rerun them merely to recreate evidence.
- `plans/checkpoints/cool-reef-8673.evidence.md:22-27` records failed Azure, AWS, and Testbox submissions but no passing canonical run reference.
- `package.json:1668` maps the registered `npm test` command to the full `scripts/test-projects.mjs` suite.

## Knowledge Base

- `learnings/tooling/2026-08-20_canonical-gate-evidence-remains-provider-owned.md`: local output cannot replace a concrete provider-owned run reference.
- `learnings/tooling/2026-08-20_canonical-test-gate-evidence-cannot-be-reconstructed.md`: record the canonical reference, exit code, and complete totals; keep code unchanged unless the gate exposes a real regression.
- `learnings/test-failures/cool-reef-8673-doctor-refusal-and-quarantine.md`: the package migration proof is already complete and remains historical evidence.
- Knowledge search used local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `openclaw-testing`: identify and inspect the owning canonical runner without substituting a local full-suite run.
- `task-evidence`: preserve exact historical command outcomes and gaps; the parent artifact already exists at `plans/checkpoints/cool-reef-8673.evidence.md`.
- `save-learning`: record the provider-evidence handoff pattern as the final implementation action.

## Implementation

1. Confirm the owner-provided Test Gate will run the registered command `cd ~/Projects/openclaw-fork && npm test` against the preserved parent implementation state. Require an immutable provider/run reference before treating execution as canonical.
2. Submit the command through that owning infrastructure. Do not replace it with local `npm test`, focused Vitest totals, or a self-assigned run label.
3. If infrastructure cannot start, record the provider, attempted run reference, exact failure, and status in `plans/checkpoints/swift-reef-2433.test-gate.md`; keep the task blocked and request owner remediation rather than claiming completion.
4. If the suite fails, classify the first actionable failure against the parent doctor-migration files. Leave unrelated failures as explicit blockers. For a reproducible parent-owned defect only, add the smallest focused regression/fix, rerun that focused command, then resubmit the unchanged canonical gate.
5. On success, write `plans/checkpoints/swift-reef-2433.test-gate.md` with provider/run reference or URL, tested revision/workspace provenance, exact command, timestamps, exit code `0`, and complete test-file/test totals. Link the historical genuine RED/GREEN proof at `plans/checkpoints/cool-reef-8673.red-green-proof.md`; do not manufacture a new RED.
6. Write `plans/checkpoints/swift-reef-2433.checkpoint.md` linking the plan, parent proof, and passing gate artifact, and mark only `goal-008` complete. Run `git diff --check` over the evidence files, then invoke `skill:save-learning` as the final action.

## Files to Modify

| File                                              | Change                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `plans/checkpoints/swift-reef-2433.test-gate.md`  | Record the canonical provider/run reference, exact command, exit code, and full totals |
| `plans/checkpoints/swift-reef-2433.checkpoint.md` | Link this plan, parent RED/GREEN proof, and goal-008 evidence                          |
| `learnings/tooling/<generated-name>.md`           | Save the canonical-run handoff learning                                                |

Production and test files remain unchanged unless step 4 proves a parent-owned defect.

## TDD: skip

This is an evidence-only follow-up with an existing authentic RED/GREEN artifact; creating a new failing test after implementation would fabricate RED provenance.

## Dependencies

- Caller/monitor access to the canonical Test Gate and a durable non-`not-run` run reference.
- The preserved parent implementation and `plans/checkpoints/cool-reef-8673.red-green-proof.md` as historical provenance.
- Completion requires a passing canonical run; another infrastructure-blocked attempt is evidence of a blocker, not acceptance.

---

_Created: 2026-08-23_  
_Status: DRAFT_
