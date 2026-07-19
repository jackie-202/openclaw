# Plan 2026-07-19: Remove fork-only trajectory batched writer and cron trajectory opt-out

Use the two feature commits as deletion ledgers, restore their pre-feature call paths, and preserve later unrelated fork changes.

## Analysis

- `47c4aff1db` added the batched writer, helper extraction, env switch, trajectory integration, tests, and docs. Its parent shows the intended fork baseline: queued writes use `appendRegularFile(...)`, while trajectory runtime uses `getTrajectoryWindowWriter(...)` and persists on recorder flush.
- `7dd48ebcb8` later widened `QueuedFileWriterDiagnostics.activeOperation` for the window writer. Preserve that unrelated typing fix while manually reversing `47c4aff1db`.
- `b0da725a11` added the complete opt-out chain: cron payload type -> prepared context -> executor -> embedded-runner params -> attempt recorder helper, plus focused tests and one fixture default.
- Current `upstream/main` contains neither feature but has since moved trajectory storage to SQLite. Verify the removed seams against upstream; document the pre-existing JSONL/window-vs-SQLite branch difference instead of replacing whole divergent modules.
- Keep every `plans/` and `learnings/` artifact from both commits untouched.

## Available Skills

- `tdd`: record the removal RED/GREEN proof in `plans/checkpoints/calm-fork-4679.red-green-proof.md`.
- `openclaw-testing`: choose targeted local tests and remote broad checks.
- `autoreview`: run the mandatory fresh review after implementation and verification.
- `save-learning`: record implementation-specific parity/removal findings last.

## Implementation

1. Use `git show 47c4aff1db` and `git show 47c4aff1db^:<path>` while editing each affected file; do not apply a whole-commit revert.
2. In `src/agents/queued-file-writer.ts`, remove `createBatchedFileWriter`, its public types/constants/schedulers, persistent-handle safety helpers introduced by the commit, `isBatchedWriterEnabled`, closable/eviction helpers, and the legacy/batched split. Restore one cached queued writer whose every queued line calls upstream-owned `appendRegularFile(...)`; retain the later `"file-replace"` diagnostic union needed by trajectory window writes.
3. In `src/trajectory/runtime.ts`, restore the pre-feature type-only queued-writer import, `TRAJECTORY_RUNTIME_CAPTURE_MAX_BYTES` init/export, simple bounded cache eviction, `getTrajectoryWindowWriter(...)`, string-returning event builder, and ordinary `writer.flush()`. Remove critical-event classification, `flushNow` probing, handle close/delete lifecycle, and direct `getQueuedFileWriter(...)` integration; retain the later diagnostic alias and unrelated window/security logic.
4. In `src/agents/queued-file-writer.test.ts`, remove env forcing, manual scheduler, batched-writer suites, and env-switch suites while retaining the pre-existing queued append, bounds, permissions, symlink, and diagnostics tests. In `src/trajectory/runtime.test.ts`, remove only the two `flushNow` tests added by `47c4aff1db`.
5. Delete only `## Batched runtime writer` from `docs/tools/trajectory.md`; leave trajectory enablement, timeout, privacy, and limits documentation unchanged.
6. Use `git show b0da725a11` to remove `CronAgentTurnPayloadFields.trajectory`, `PreparedCronRunContext.trajectoryEnabled`, extraction/defaulting, executor params, and forwarding from `src/cron/types.ts`, `src/cron/isolated-agent/run.ts`, and `src/cron/isolated-agent/run-executor.ts`.
7. Remove `trajectoryEnabled` from `src/agents/embedded-agent-runner/run/params.ts` and `src/agents/embedded-agent-runner/run.ts`; delete `resolveAttemptTrajectoryRecorder` and call `createTrajectoryRuntimeRecorder(...)` directly in `run/attempt.ts`.
8. Remove the two cron forwarding tests, the message-tool fixture default, the attempt helper tests/import, and no other assertions.
9. Format touched files, inspect `git diff --numstat`, and trim any compatibility wrappers or dead exports left by the removal.

## Files to Modify

| Files                                                                | Change                                                                                       |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/agents/queued-file-writer.ts`                                   | Restore the single per-write queued append implementation; preserve later diagnostic typing. |
| `src/agents/queued-file-writer.test.ts`                              | Remove batching/env tests and keep original writer behavior coverage.                        |
| `src/trajectory/runtime.ts`                                          | Restore the window-writer recorder path and ordinary flush lifecycle.                        |
| `src/trajectory/runtime.test.ts`                                     | Remove only batching-specific critical-flush tests.                                          |
| `docs/tools/trajectory.md`                                           | Remove the batched-writer section and env kill-switch.                                       |
| `src/cron/types.ts`                                                  | Remove the cron payload field.                                                               |
| `src/cron/isolated-agent/run.ts`                                     | Remove defaulting and prepared-context propagation.                                          |
| `src/cron/isolated-agent/run-executor.ts`                            | Remove executor fields and embedded-runner forwarding.                                       |
| `src/cron/isolated-agent/run.cron-model-override-forwarding.test.ts` | Remove the two opt-out/default tests.                                                        |
| `src/cron/isolated-agent/run.message-tool-policy.test.ts`            | Remove the feature-only fixture default.                                                     |
| `src/agents/embedded-agent-runner/run/params.ts`                     | Remove the run parameter.                                                                    |
| `src/agents/embedded-agent-runner/run.ts`                            | Remove attempt forwarding.                                                                   |
| `src/agents/embedded-agent-runner/run/attempt.ts`                    | Remove the helper and restore direct recorder creation.                                      |
| `src/agents/embedded-agent-runner/run/attempt.test.ts`               | Remove helper import and tests.                                                              |

## TDD

Implement the cycle with `skill:tdd` and record evidence in `plans/checkpoints/calm-fork-4679.red-green-proof.md`.

**Test file:** `src/agents/queued-file-writer.test.ts`  
**Run command:** `pnpm test src/agents/queued-file-writer.test.ts`  
**Edit first:** remove the batching import/env setup and batching-only suites, leaving this existing upstream-owned assertion unpinned to legacy mode.

```typescript
import { getQueuedFileWriter } from "./queued-file-writer.js";

it("drops writes that would exceed the pending queue cap", async () => {
  const filePath = path.join(makeTempDir(), "trace.jsonl");
  const writer = getQueuedFileWriter(new Map(), filePath, { maxQueuedBytes: 6 });

  expect(writer.write("12345\n")).toBe("queued"); // RED: current default batched writer returns undefined
  expect(writer.write("after\n")).toBe("dropped");
  await writer.flush();
  expect(fs.readFileSync(filePath, "utf8")).toBe("12345\n");
});
```

| Test              | RED before production removal                                       | GREEN after removal                                                                 |
| ----------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Pending queue cap | First write returns `undefined` through the default batched writer. | First write is queued, second is dropped, and only the bounded content is appended. |

## Verification

1. Run focused tests: `pnpm test src/agents/queued-file-writer.test.ts src/trajectory/runtime.test.ts src/cron/isolated-agent/run.cron-model-override-forwarding.test.ts src/cron/isolated-agent/run.message-tool-policy.test.ts src/agents/embedded-agent-runner/run/attempt.test.ts`.
2. Use `openclaw-testing` to run broader changed checks remotely when the isolated-agent/embedded-runner fanout is large; record the provider and run ID.
3. Run `pnpm build` because embedded-runner published/lazy boundaries are touched.
4. Run `git grep -n "createBatchedFileWriter\|OPENCLAW_TRAJECTORY_BATCH" -- src/` and require no matches.
5. Run `git grep -n "trajectory" -- src/cron/`; require no cron opt-out field, propagation, or tests.
6. Run `git grep -n "trajectoryEnabled" -- src/agents/embedded-agent-runner src/cron` and require no matches.
7. Run `git diff upstream/main -- <file>` for every production/test/doc file above. Classify every remaining hunk as unrelated fork behavior; explicitly call out the existing trajectory JSONL/window storage divergence from upstream's SQLite storage.
8. Run `git diff --check`, then `autoreview` until no accepted actionable findings remain.

---

_Task: `calm-fork-4679`_  
_Status: DRAFT_
