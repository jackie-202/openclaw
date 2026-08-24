# Plan 2026-08-23: Canonical Test Gate Evidence Follow-up

Supply the one missing caller-owned full-suite result without altering the completed doctor migration.

_Status: DRAFT_
_Created: 2026-08-23_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Parent implementation and evidence

- `plans/2026-08-23_swift-reef-2433_red-green-ship-and-verify-the-doctor-migration-artifact.md` scoped the prior retry to one caller-owned `npm test` run and forbade replacement by focused/local results.
- `plans/checkpoints/swift-reef-2433.test-gate.md` records Blacksmith, Azure, and AWS failures before allocation; no `tbx_...`/`cbx_...` ID exists and `npm test` never ran.
- `plans/checkpoints/swift-reef-2433.checkpoint.md` leaves only canonical gate execution incomplete. `plans/checkpoints/swift-reef-2433.evidence.md` has truncated commands and unavailable outcomes, so it cannot supply the missing pass.
- `plans/checkpoints/cool-reef-8673.red-green-proof.md` remains the genuine historical doctor-migration RED/GREEN proof. Do not manufacture a second RED.
- The preserved implementation is in a heavily dirty workspace; the canonical run must identify the exact synced source state rather than cite `HEAD` alone.

### Canonical gate workflow

- `package.json:1668` maps `npm test` to `node scripts/test-projects.mjs`; `docs/reference/test.md:24` defines an untargeted run as full-suite proof.
- `skill:crabbox` requires reporting the actual backend and durable ID: AWS uses `cbx_...`; Blacksmith Testbox through Crabbox uses `tbx_...` plus its Actions run.
- Provider allocation prerequisites must be checked before dispatch. A pre-allocation failure remains `BLOCKED`, never `PASS`.

### Knowledge base

- `learnings/tooling/swift-reef-2433-provider-preflight-before-canonical-gate.md`: preflight each provider's executable/auth prerequisites before an expensive run.
- `learnings/tooling/swift-reef-2433-canonical-gate-evidence-needs-run-provenance.md`: a pass needs provider/run reference, exact command, source provenance, exit code, and complete totals.
- `learnings/tooling/2026-08-20_canonical-test-gate-evidence-cannot-be-reconstructed.md`: keep source/tests unchanged unless the gate exposes a real regression.
- `learnings/architecture/rules-acceptance-closure-requires-complete-canonical-gate.md`: focused tests and build cannot be promoted to a green canonical gate.
- `skill:recall-knowledge` used local fallback because QMD collection `openclaw-fork-learnings` was unavailable; its returned architecture files were not relevant to this evidence-only retry.

## Available Skills

- `openclaw-testing`: preserve full-suite semantics and classify any real failure before changing code.
- `crabbox`: preflight, submit, and capture the actual provider, lease/Testbox ID, Actions URL when applicable, timing summary, and exit code.
- `task-evidence`: generate exact session evidence after execution without reconstructing missing outcomes.
- `save-learning`: mandatory final action after the implementation/evidence session.

## Approach

Use a preflight-first canonical gate retry against the preserved workspace. Accept only a provider-owned `npm test` pass tied to the exact synced content; keep the new task blocked if no caller-owned runner allocates. Parent evidence stays immutable.

## Execution Steps

1. Reconfirm `plans/checkpoints/swift-reef-2433.test-gate.md` is still pre-allocation `BLOCKED`, `plans/checkpoints/cool-reef-8673.red-green-proof.md` contains the authentic RED/GREEN proof, and no newly available caller Test Gate result already satisfies `finding-001`.
2. Preflight one caller-approved provider before dispatch: verify the selected wrapper/binary, provider advertisement, authentication, and allocation capability. Prefer the configured brokered path or Blacksmith Testbox through Crabbox; do not ask for raw cloud keys or repeat known-unavailable providers blindly.
3. Record source provenance before sync: `HEAD`, `git status --short`, and a sanitized digest/manifest of the task-owned preserved implementation files. Because the workspace is dirty, a commit SHA alone is insufficient.
4. Run exactly `npm test` from the remotely synced repository root through the caller-owned gate. Capture provider, `cbx_...` or `tbx_...` ID, Actions/run URL when present, timestamps, tested source provenance, exact command, exit code, and complete test-file/test totals.
5. If allocation fails, write the exact preflight/allocation error and absent run ID to `plans/checkpoints/warm-fork-8061.test-gate.md`, leave goal-001 blocked, and stop. Local/focused results cannot substitute.
6. If `npm test` fails, preserve the first actionable failure and determine whether it reproduces against the parent doctor-migration surface. Do not modify code for unrelated failures. Only a demonstrated parent-owned defect permits the smallest regression/fix followed by focused proof and a fresh canonical `npm test` submission.
7. On exit code `0`, write `plans/checkpoints/warm-fork-8061.test-gate.md` as `PASS`; link the provider run and `plans/checkpoints/cool-reef-8673.red-green-proof.md`. Generate `plans/checkpoints/warm-fork-8061.evidence.md` with `skill:task-evidence` and report any extraction gaps without weakening the provider artifact.
8. Update `plans/checkpoints/warm-fork-8061.checkpoint.md` to link this plan and gate artifact and mark goal-001 complete only after the passing run reference exists. Run `git diff --check -- plans/2026-08-23_warm-fork-8061_acceptance-fix-red-green-ship-and-verify-the-doctor.md plans/checkpoints/warm-fork-8061.test-gate.md plans/checkpoints/warm-fork-8061.checkpoint.md plans/checkpoints/warm-fork-8061.evidence.md`, then invoke `skill:save-learning` as the final action.

## Files to Modify

| File                                             | Change                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------- |
| `plans/checkpoints/warm-fork-8061.test-gate.md`  | Record provider-owned canonical run provenance and PASS/BLOCKED/FAIL result |
| `plans/checkpoints/warm-fork-8061.checkpoint.md` | Link this plan, parent RED/GREEN proof, and goal-001 result                 |
| `plans/checkpoints/warm-fork-8061.evidence.md`   | Store task/session evidence generated by `skill:task-evidence`              |
| `learnings/tooling/<generated-name>.md`          | Save the mandatory session learning                                         |

Production and test files remain unchanged unless step 6 proves a parent-owned defect.

## TDD: skip

This is an evidence-only retry with an existing genuine RED/GREEN artifact; creating a post-implementation RED would fabricate provenance.

## Dependencies

- Caller-owned runner access capable of allocating a durable run and executing the full `npm test` suite.
- Remote sync that preserves the exact task-owned dirty-worktree implementation state.
- Completion requires a passing non-`not-run` reference; another infrastructure blocker is not acceptance.
