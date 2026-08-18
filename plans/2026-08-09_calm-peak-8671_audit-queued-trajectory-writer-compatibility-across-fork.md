# Plan 2026-08-09: Audit queued trajectory writer compatibility across fork and upstream

Produce a source-backed contract matrix without changing or executing the product.

## Analysis

### Codebase Context

- `src/agents/queued-file-writer.ts` owns per-path serialization, queue/file byte caps, lossy backpressure, diagnostics, append safety, and write-failure handling.
- `src/trajectory/runtime.ts` owns trajectory buffering, ordering, per-path flush serialization, writer caching/eviction, recorder flush, and diagnostic projection.
- `src/agents/embedded-agent-runner/run/attempt-trajectory-flush-cleanup.ts` and `src/agents/agent-command.ts` connect recorder flushes to normal run cleanup; process-signal guarantees require separate proof and must not be inferred from these callers.
- `src/agents/queued-file-writer.test.ts`, `src/trajectory/runtime.test.ts`, and `src/agents/embedded-agent-runner/run/attempt-trajectory-flush-cleanup.test.ts` are the primary test inventory.
- `47c4aff1db67` adds persistent-handle batching, debounce/immediate flush, close, cache eviction, and critical-event flushing; `7dd48ebcb8db` adds `file-replace` to the shared diagnostic union and removes the trajectory-local type widening.
- `4b85d834ed1586062f31bded2f358fc5192d1674` is the locally available `upstream/main` comparison snapshot.

### Relevant Documentation

- `docs/tools/trajectory.md` documents cleanup flushing, timeout behavior, and capture limits; use it only to classify public guarantees, not as runtime proof.
- `src/agents/AGENTS.md` and `src/agents/embedded-agent-runner/run/AGENTS.md` require focused source/test proof and preservation of the production cleanup composition.

### Knowledge Base

- `learnings/architecture/2026-07-19_separate-fork-behavior-from-upstream-compatibility-surfaces.md`: report fork-only behavior separately from upstream compatibility.
- `recall-knowledge` used local fallback because `openclaw-fork-learnings` was absent; the remaining returned files had no substantive writer-specific guidance.

## Available Skills

- `compound-plan`: persist and structure this investigation.
- `recall-knowledge`: apply relevant project learnings.
- `save-learning`: record a reusable investigation-planning lesson after the plan is complete.

## Solutions

Use an evidence ledger keyed by commit, file, symbol, and test name, then derive one matrix row per required contract. Keep three layers distinct: generic writer, trajectory adapter, and lifecycle caller. Mark a guarantee as unproven whenever source intent lacks a direct test, and mark upstream as weaker only when the exact base snapshot proves the difference.

## Implementation

### Investigation Steps

1. **Reproduce:** Verify the three commit objects and materialize the relevant blobs with `git show <sha>:<path>` for `src/agents/queued-file-writer.ts`, `src/trajectory/runtime.ts`, their tests, cleanup helper/tests, and `docs/tools/trajectory.md`. Record blob/SHA provenance and use direct snapshot comparison rather than branch-tip assumptions; do not run tests, modify source, inspect live state, fetch external repos, or perform Git lifecycle operations.
2. **Trace:** Follow `write -> queued/batched writer -> flush/flushNow/close -> trajectory recorder -> attempt and fallback cleanup` at each snapshot. Trace cache eviction and all maps by file path, and search local source for signal/exit hooks so normal cleanup, abrupt process termination, and unsupported guarantees remain separate.
3. **Diagnose:** Build a contract matrix with rows for ordering, flush/close guarantees, process termination, bounded memory and on-disk bytes, backpressure/drop behavior, concurrent file paths and same-path recorders, diagnostics, and write failures/error propagation. Use columns `Contract`, `Fork 47c4aff1`, `Type alignment 7dd48eb`, `Upstream 4b85d834`, `Existing test proof`, `Unproven contract`, `Weaker upstream guarantee`, and `Source evidence`. Inventory every relevant test by name and state exactly which dimension it proves; do not treat comments, types, or swallowed promises as behavioral proof.
4. **Write report:** Before writing, prefer `python3 scripts/investigation-path.py --task-id calm-peak-8671 --project . --touch` when the helper exists. Since it is currently absent, create `plans/investigations/` if needed and use `plans/investigations/calm-peak-8671_audit-queued-trajectory-writer-compatibility-across-fork-and-upstream.md`. Write Markdown only, make weaker upstream guarantees explicit in the matrix, and end with exactly one `Proposal verdict:` followed by one `Confidence:` and one `Evidence:` line; include no second or alternative verdict.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/investigations/calm-peak-8671_audit-queued-trajectory-writer-compatibility-across-fork-and-upstream.md` | Add the final contract matrix, test gaps, and single proposal verdict after resolving the report path. |

## TDD: skip

This is a read-only historical investigation, and the scope explicitly prohibits code edits and test execution.

## Dependencies

- The named commits and their blobs must remain available in the local repository.
- Conclusions are limited to OpenClaw source, history, tests, and docs at the named snapshots.
- The final report path helper takes precedence if it appears before the report-writing step; otherwise the deterministic fallback above is canonical.

---
*Created: 2026-08-09*
*Status: DRAFT*
