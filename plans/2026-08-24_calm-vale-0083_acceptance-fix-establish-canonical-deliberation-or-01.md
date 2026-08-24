# Plan 2026-08-24: Complete the canonical Deliberation OR-01 through OR-23 gate

Finish the preserved gate through one clean canonical run; change code only if that run exposes a gate-owned defect.

## Analysis

- `scripts/deliberation-full-gate.ts` already refuses dirty/live execution, runs OR-01..OR-23 and all support checks, characterizes four fail-closed negatives, and exclusively generates the ledger, final note, and readiness update.
- `scripts/lib/deliberation-full-gate-ledger.ts` already enforces exact ordered unique Green rows, four-hash KM authority, current revisions, command identity, freshness, candidate binding, and mode `0600` output.
- `plans/checkpoints/warm-peak-7301.red-green-proof.md` records fresh focused GREEN: 24 passed, one conditional OR-23 skipped. The canonical command stopped before leaf execution only because the shared checkout was dirty.
- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md:151` requires one executable OR-01..OR-23 result before audit; missing, skipped, duplicate, stale, contradictory, or synthetic evidence must fail.
- The current shared checkout contains extensive preserved tracked and untracked work. Do not weaken `preflight()`, commit unrelated changes, or treat the blocked run as completion evidence.

## Knowledge Applied

- Preserve the genuine RED from `plans/checkpoints/bright-fork-2292.red-green-proof.md`; never manufacture a post-implementation RED.
- Keep KM semantic authority bound to the four accepted file hashes; record moving KM HEAD only as provenance.
- Snapshot candidate arrays before OR-23 and independently validate candidate/final freshness.
- Keep repository readiness separate from deployment, live activation, provider authenticity, and pilot approval.
- Knowledge lookup used local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `task-evidence`: recover exact historical command/outcome provenance only if existing proof has a gap.
- `tdd`: handle a newly reproduced gate defect while linking the genuine parent RED.
- `openclaw-testing`: select bounded verification around the canonical command.
- `validate-implementation` and `autoreview`: inspect generated evidence and any defect repair.
- `save-learning`: mandatory final implementation-session action.

## Implementation

1. Compare the bright-fork and warm-peak checkpoints, proof files, task manifests, and current diff to enumerate the already-completed gate and OR-owner files; make no product or test edits during this inventory.
2. Obtain explicit authorization for a local, unpushed snapshot commit. Build an isolated checkout containing exactly that preserved task state, leave the shared worktree untouched, and require `git status --short` empty at the immutable snapshot revision.
3. Before execution, require both bright-fork final outputs to be absent and verify the four `KM_AUTHORITY` hashes. Stop with the exact blocker if clean state or authority cannot be established.
4. Run `pnpm test:deliberation:full-gate` once in the isolated checkout. If a named leaf or support command fails, preserve the failed output and repair only the reproduced gate-owned defect through `skill:tdd`; do not alter product semantics, selectors, accepted hashes, or preflight to obtain Green.
5. Validate the generated `bright-fork-2292.full-gate.json`: `kind: final`, current immutable OpenClaw revision, current KM HEAD plus four accepted hashes, mode `0600`, all support commands, four expected nonzero negative cases, candidate digest integrity, and exactly one ordered Green row for OR-01..OR-23.
6. Validate `bright-fork-2292.final-note.md` contains the canonical command, revisions, four hashes, artifact hash, all 23 named results, negative characterization, support results, elapsed time, and explicit non-live/non-rollout scope.
7. Confirm `fresh-peak-7129.rollout-readiness.md` consumes only the validated bright-fork artifact, reports repository `23/23 Green`, and leaves deployment, activation, authenticity, and pilot readiness unknown.
8. Transfer the three generator-produced files byte-for-byte to the shared checkout, verify their SHA-256 values against the isolated outputs, and record the immutable revision, command result, artifact hash, and validation checks in `plans/checkpoints/calm-vale-0083.checkpoint.md`.
9. Run `skill:validate-implementation` and a fresh bounded `skill:autoreview`; resolve only accepted actionable findings, then invoke `skill:save-learning` last and save at least one learning.

## Files to Modify

| File                                                                                                                               | Change                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `plans/checkpoints/bright-fork-2292.full-gate.json`                                                                                | Generate exclusively from the successful canonical run; never hand-edit.          |
| `plans/checkpoints/bright-fork-2292.final-note.md`                                                                                 | Generate the complete canonical completion report.                                |
| `plans/checkpoints/fresh-peak-7129.rollout-readiness.md`                                                                           | Replace historical quick-brook input with validated bright-fork evidence.         |
| `plans/checkpoints/calm-vale-0083.checkpoint.md`                                                                                   | Record snapshot, canonical command, hashes, validation, and closeout evidence.    |
| `scripts/deliberation-full-gate.ts`, `scripts/lib/deliberation-full-gate-ledger.ts`, `test/scripts/deliberation-full-gate.test.ts` | No planned edits; change only for a defect reproduced by the clean canonical run. |

## TDD

Do not create a new RED for completed parent work. Reuse the genuine RED in `plans/checkpoints/bright-fork-2292.red-green-proof.md`; if implementation changes become necessary, follow `skill:tdd` and capture fresh matching GREEN with:

**Test file:** `test/scripts/deliberation-full-gate.test.ts`  
**Run command:** `env OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`

```ts
import { expect, it } from "vitest";
import { assertNoLiveEnvironment } from "../../scripts/lib/deliberation-full-gate-ledger.js";

it("rejects a live execution environment before running children", () => {
  expect(() => assertNoLiveEnvironment({ OPENCLAW_LIVE_TEST: "1" })).toThrow(
    "live execution environment",
  ); // Genuine historical RED: assertNoLiveEnvironment was absent.
});
```

| Proof                 | RED                                                                          | GREEN                                                               |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Focused gate behavior | Parent command exited 1 with 10 failures before implementation.              | Exact command exits 0 with all focused tests passing.               |
| Canonical completion  | Prior run stopped at clean-checkout preflight and emitted no final artifact. | Canonical command exits 0 and emits validated 23/23 Green evidence. |

## Verification

1. `env OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose` only if code changes are required.
2. `pnpm test:deliberation:full-gate` once from the clean immutable checkout; require exit 0 and ordered OR-01..OR-23 Green output.
3. Validate the JSON, final note, readiness file, file mode, and transferred SHA-256 values without rerunning the exclusive canonical command.
4. `git diff --check`

## Dependencies

- Explicit authorization for an isolated local snapshot commit; do not commit, stash, revert, or clean the shared worktree.
- Read-only `$HOME/.openclaw/workspace/km-system` containing the four accepted artifact hashes and a valid current Git HEAD.
- No KM edits, deployment, live linking, Gateway restart, live configuration, production spool, provider send, or pilot activation.

_Status: DRAFT_
