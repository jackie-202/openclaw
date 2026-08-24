# Plan 2026-08-24: Complete canonical Deliberation OR-01 through OR-23 evidence

Finish the preserved gate through one clean canonical run; change code only if that run exposes a gate-owned defect.

## Analysis

### Preserved implementation

- `scripts/deliberation-full-gate.ts` already performs clean/no-live preflight, OR-01..OR-22 and support execution, four negative verifier cases, immutable candidate snapshotting, OR-23, exclusive ledger output, final-note generation, and readiness generation.
- `scripts/lib/deliberation-full-gate-ledger.ts` already enforces ordered unique Green leaves, fixed four-file KM authority, moving KM HEAD provenance, command/report identity, freshness, candidate digest binding, and mode-`0600` output.
- `test/scripts/deliberation-full-gate.test.ts` already covers moving KM HEAD, environment isolation, fail-closed verification, stale evidence, candidate/final integrity, and conditional OR-23.
- `plans/checkpoints/bright-fork-2292.red-green-proof.md` now contains the genuine matching RED and GREEN command, but the acceptance run evaluated an earlier RED-only snapshot; the follow-up needs attributable fresh GREEN evidence.
- `plans/checkpoints/bright-fork-2292.full-gate.json` and `plans/checkpoints/bright-fork-2292.final-note.md` remain absent. `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` remains unknown and names historical quick-brook evidence.
- The gate files are untracked and the shared checkout has extensive adjacent changes. Do not weaken preflight or mix unrelated changes merely to make the checkout appear clean.

### Contract constraints

- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:151` requires exactly one executable OR-01..OR-23 result and fail-closed rejection of incomplete or synthetic evidence.
- KM semantic authority is the four accepted artifact hashes; current KM HEAD is traceability only.
- Preserve the candidate arrays before OR-23 and validate candidate and final timestamps independently.
- Keep deployment, live activation, provider authenticity, pilot traffic, and rollout approval explicitly unknown.

### Knowledge base

- `learnings/tooling/bright-fork-2292-finalization-evidence-snapshots.md`: copy command/leaf arrays before OR-23 and retain clean-checkout refusal.
- `learnings/tooling/bright-fork-2292-canonical-gate-authority-and-support.md`: separate hash authority from support commands and sanitize all child environments.
- `learnings/tooling/2026-08-21_acceptance-green-must-match-historical-red-command.md`: link genuine RED and capture fresh GREEN with the exact same command.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: a blocked prior run is context, not completion evidence.
- Knowledge search used local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `task-evidence`: recover and cite exact parent command/outcome provenance without reconstructing history.
- `tdd`: capture the follow-up GREEN and link the genuine parent RED.
- `openclaw-testing`: choose the bounded preflight and canonical validation path.
- `validate-implementation` and `autoreview`: check the generated evidence and any defect fix.
- `save-learning`: mandatory final implementation-session action.

## Implementation

1. Invoke `skill:task-evidence` for `bright-fork-2292`; link its exact RED/GREEN provenance and `plans/checkpoints/bright-fork-2292.red-green-proof.md` from a new `plans/checkpoints/warm-peak-7301.red-green-proof.md`. Report any evidence gap instead of fabricating history.
2. Invoke `skill:tdd` and rerun the exact parent command `env OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`; record timestamp, exit code, full passing output, and command hash as the follow-up GREEN.
3. Prepare an authorized clean task checkout at one committed revision containing the preserved gate plus all fixed OR owner surfaces. Enumerate task-owned files from task lineage and diff review; never use `git add -A`, commit unrelated dirt, stash/revert user changes, create synthetic evidence, or relax `preflight()`.
4. Before the canonical run, require `git status --short` to be empty, the two bright-fork final outputs to be absent, and the four KM files to match `KM_AUTHORITY`. If the task runner cannot provide that clean committed state, stop and request the clean-checkout owner action rather than repeating the parent failure.
5. Run `pnpm test:deliberation:full-gate` once. If a named OR leaf or required support command fails, repair only the proven gate-owned defect with a new focused RED/GREEN cycle; do not change product semantics, leaf selectors, accepted hashes, support requirements, or readiness wording to obtain Green.
6. Validate `plans/checkpoints/bright-fork-2292.full-gate.json`: schema `final`, exactly 23 ordered unique `OR-01`..`OR-23` Green leaves, one reporter result per selector, fresh command evidence, matching OpenClaw revision, current KM HEAD plus four accepted hashes, candidate digest integrity, all support commands, four expected nonzero negative cases, and file mode `0600`.
7. Validate `plans/checkpoints/bright-fork-2292.final-note.md` includes the canonical command, revisions, four hashes, artifact hash, all 23 named results, negative characterization, build/package/provenance/focused results, elapsed time, and non-live/non-rollout scope.
8. Confirm `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` references only the validated bright-fork artifact and reports repository Green while leaving deployment, activation, authenticity, and pilot readiness unknown.
9. Update `plans/checkpoints/bright-fork-2292.checkpoint.md` with the successful canonical command, revision, 23/23 result, artifact hash, fresh TDD proof link, and closeout commands. Invoke `skill:validate-implementation`, then fresh bounded `skill:autoreview` until no accepted actionable findings remain.
10. Invoke `skill:save-learning` last and save at least one learning about completing immutable evidence from an authorized clean checkout.

## Files to Modify

| File                                                                                                                               | Change                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `plans/checkpoints/warm-peak-7301.red-green-proof.md`                                                                              | Link genuine parent RED and capture attributable fresh matching GREEN.           |
| `plans/checkpoints/bright-fork-2292.full-gate.json`                                                                                | Generate exclusively from the successful canonical run; never hand-edit.         |
| `plans/checkpoints/bright-fork-2292.final-note.md`                                                                                 | Generate the complete canonical completion report.                               |
| `plans/checkpoints/fresh-peak-7129.rollout-readiness.md`                                                                           | Replace historical quick-brook input with validated bright-fork evidence.        |
| `plans/checkpoints/bright-fork-2292.checkpoint.md`                                                                                 | Record final canonical and closeout evidence.                                    |
| `scripts/deliberation-full-gate.ts`, `scripts/lib/deliberation-full-gate-ledger.ts`, `test/scripts/deliberation-full-gate.test.ts` | No planned edits; touch only for a defect reproduced by the clean canonical run. |

## TDD

Implement any newly exposed defect with `skill:tdd`. Do not create a new RED for already-completed parent work.

**Test file:** `test/scripts/deliberation-full-gate.test.ts`  
**Run command:** `env OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`  
**Evidence:** parent RED in `plans/checkpoints/bright-fork-2292.red-green-proof.md`; fresh follow-up GREEN in `plans/checkpoints/warm-peak-7301.red-green-proof.md`.

```ts
import { expect, it } from "vitest";
import { assertNoLiveEnvironment } from "../../scripts/lib/deliberation-full-gate-ledger.js";

it("rejects a live execution environment before running children", () => {
  expect(() => assertNoLiveEnvironment({ OPENCLAW_LIVE_TEST: "1" })).toThrow(
    "live execution environment",
  ); // Historical RED failed because the no-live guard did not exist.
});
```

| Proof                              | RED                                                                            | GREEN                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Moving KM HEAD and gate validation | Parent command exited 1 with 10 failures before implementation.                | Exact command exits 0 with all focused tests passing.                                 |
| Canonical completion               | Parent canonical run stopped at dirty preflight and emitted no final artifact. | Clean canonical command exits 0 and emits exactly 23/23 Green plus validated reports. |

## Verification

1. `env OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`
2. `pnpm test:deliberation:full-gate`
3. Inspect generated JSON/note/readiness against steps 6-8; do not rerun the exclusive canonical command after successful output creation.
4. `git diff --check`
5. Run the bounded changed-surface command selected by `skill:openclaw-testing`; rely on the canonical ledger for its embedded build, package OR-22, focused, lint, type, singleton, and negative proof.

## Dependencies

- Authorized clean checkout containing the preserved committed task state; the current shared dirty checkout is not acceptable canonical evidence.
- Read-only `$HOME/.openclaw/workspace/km-system` with the four exact accepted artifact hashes and a valid current Git HEAD.
- No KM edits, deployment, live installation linking, Gateway restart, live configuration, production spool, provider send, or pilot activation.

_Status: DRAFT_
