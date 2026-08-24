# Plan 2026-08-19: Supply canonical deliberation suite evidence

Record a caller-owned successful Test Gate for the preserved Discord thread-metadata assertion; do not change implementation or tests.

## Analysis

### Codebase Context

- `extensions/deliberation/scripts/intake-producer.test.ts:70-75` already asserts that a Discord message without `threadId` omits both `sourceThreadId` forms.
- `plans/checkpoints/swift-crag-0793.checkpoint.md:7` records only a local 12-file, 243-test pass.
- `plans/checkpoints/acceptance-runs/swift-crag-0793-acceptance-001/result.json:14-25` rejects that checkpoint because its Test Gate is `not-run`.
- The worktree has inherited deliberation contract, runtime, and test changes; leave them untouched unless the exact gate exposes a real defect.

### Documentation

- `docs/reference/test.md:11-14` defines local test commands only; local output cannot be relabeled as canonical gate evidence.
- `plans/checkpoints/fresh-wave-6142.test-gate.md:11-32` demonstrates the required gate artifact shape: exact command, run result, complete summary, and explicit gate status.

### Knowledge Base

- `learnings/tooling/swift-crag-0793-fresh-canonical-suite-evidence.md:12-14`: rerun the requested command verbatim, preserve unrelated dirty-worktree changes, and record exact totals.
- Recall used the local fallback because the `openclaw-fork-learnings` collection is unavailable; its returned architecture entries do not add applicable evidence requirements.

## Available Skills

- `openclaw-testing`: select and execute only the exact required suite.
- `acceptance`: evaluate the fresh retry manifest after the Test Gate artifact is attached.
- `task-evidence`: link the parent RED/GREEN provenance without fabricating a post-change RED.
- `save-learning`: save one evidence-provenance learning as the final action.

## Implementation

1. Inspect `git diff --name-only` and preserve the existing assertion; do not edit `extensions/deliberation/src/**` or unrelated dirty paths.
2. Run exactly `pnpm vitest run extensions/deliberation` through the caller-owned Test Gate, not merely a local shell session.
3. Create `plans/checkpoints/fresh-cove-4093.test-gate.md` with the verbatim command, non-`not-run` gate run reference, exit code 0, full suite summary including 12 passed files and 243 passed tests, and a `PASS` status.
4. Create `plans/checkpoints/fresh-cove-4093.checkpoint.md` linking the parent assertion, historical RED/GREEN provenance if available, and the fresh gate artifact. State that no production or test file changed.
5. Run `acceptance` against the monitor-supplied retry manifest. Require `finding-001` to be absent and the Test Gate reference to resolve to the fresh artifact; otherwise report the missing monitor-owned evidence as blocked without inventing it.
6. Run `git diff --check` for the two evidence files. Invoke `save-learning` last and make no edits afterward.

## Files to Modify

| File                                              | Change                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `plans/checkpoints/fresh-cove-4093.test-gate.md`  | Canonical Test Gate command, run reference, successful complete suite summary, and status. |
| `plans/checkpoints/fresh-cove-4093.checkpoint.md` | Link the preserved assertion, parent evidence, and fresh gate artifact.                    |
| `learnings/**`                                    | Add the required final-session learning through `save-learning`.                           |

## TDD: skip

This evidence-only follow-up reuses parent RED provenance and records a fresh canonical GREEN result; a new RED after the accepted assertion exists would be fabricated.

## Verification

- The canonical Test Gate ran exactly `pnpm vitest run extensions/deliberation` and has a non-`not-run` reference.
- Its artifact records exit code 0 and the complete 12-file, 243-test passing summary.
- The retry acceptance result no longer reports `finding-001`.
- `git diff --check` passes for the evidence artifacts.

## Dependencies

- The monitor or caller must supply a Test Gate run and retry manifest. A local suite invocation cannot satisfy the acceptance requirement.

---

_Status: DRAFT_
