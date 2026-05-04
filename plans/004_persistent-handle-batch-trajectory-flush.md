# Plan: Persistent-Handle + Batch Trajectory Flush

**Status:** Draft, not yet approved for implementation
**Author context:** Sequel to `2026-05-03_warm-fork-9899` and the cron concurrency tuning episode (2026-05-03 → 2026-05-04).
**Risk:** Medium (security re-check window, FD limit, crash loss window).
**Reversibility:** Trivial via env kill-switch (`OPENCLAW_TRAJECTORY_BATCH=0`).
**Estimated effort:** 1–2 days solo dev including tests, benchmark, security review.

---

## Problem

Gateway suffers event-loop starvation under concurrent cron load. With `cron.maxConcurrentRuns ≥ 3`, p99 event-loop delay spikes from <500 ms to ~30 s, status connections queue 11–17 s, and `runAgentCleanupStep` fires `cleanup timed out` warnings on `pi-trajectory-flush`. Workaround applied 2026-05-04 (`maxConcurrentRuns: 2`, `payload.trajectory: false` on 14/34 jobs, 5-job stagger via `anchorMs`) restored health, but **caps real concurrency at 2**, far below the 28-core hardware budget. The trajectory writer is the single biggest contributor.

## Analysis

### Mechanism (corrected from "threads waiting on each other")

OpenClaw gateway is a **single-threaded Node.js event loop with a libuv worker pool of 4** (default `UV_THREADPOOL_SIZE`). There are no application threads to "wait on each other" in the traditional sense. The actual mechanism is:

1. **Per-event sync work on the main loop.** `createTrajectoryRuntimeRecorder.recordEvent` (`src/trajectory/runtime.ts:186-214`) builds a JSON line synchronously and calls `writer.write(line)`. The string build, `safeJsonStringify`, and `sanitizeDiagnosticPayload` are all main-loop CPU.
2. **Per-event async FS chain that monopolizes libuv slots.** `safeAppendFile` in `src/agents/queued-file-writer.ts` performs **6–8 sequential syscalls per event**:
   - `assertNoSymlinkParents` (parent-walk via `lstat`, ~3–5 syscalls depending on path depth)
   - `lstat(filePath)`
   - `open(filePath, O_NOFOLLOW | O_APPEND | O_CLOEXEC)`
   - `handle.stat()` for `verifyStableOpenedFile`
   - `handle.chmod(0o600)`
   - `handle.appendFile(line)`
   - `handle.close()`
3. **Saturation math.** 5 concurrent agents × ~20–100 events/run × 6–8 syscalls each → thousands of FS ops competing for **4 libuv worker slots**. `await`-points on the main loop multiply, status connections (which also need FS) starve, and the `pi-trajectory-flush` cleanup step (10 s budget per `AGENT_CLEANUP_STEP_TIMEOUT_MS`) times out because the flush queue still has work.
4. **What "threads waiting" really means here.** The libuv pool is the bottleneck, not application threads. Persistent handle + batch fixes this by **collapsing 6–8 syscalls per event into 1 syscall per N events** (typical N = 50–200 within a debounce window), which:
   - Frees libuv workers for other concurrent runs and status connections
   - Reduces main-loop `await` resumes that fragment CPU
   - Lets the cleanup `flush()` complete inside the 10 s budget even under load

### What this does NOT fix

- **`bootstrap-context: 19–21 s` per run** — that is `AGENTS.md` + `MEMORY.md` parsing in prep stage, not trajectory. TUI latency under load is dominated by this, not by trajectory flush.
- **`AGENTS.md` 19301 chars > 12000 char limit truncation warning** — orthogonal.
- **The 14 jobs already running with `payload.trajectory: false`** see no change; this fixes the path used by the 20 agentic jobs that still record.

### Current safety guarantees (must preserve)

`safeAppendFile` defends against several attacks per write today:

- Symlink injection via parent dir swap → `assertNoSymlinkParents`
- Symlink injection via target path → `O_NOFOLLOW`
- Hardlink injection → `verifyStableOpenedFile` checks `nlink === 1`
- File swap mid-run → `verifyStableOpenedFile` checks `dev/ino` stability and `isFile()`
- Permission drift → `chmod 0o600` on every open
- Size budget overflow → `preOpenStat.size + lineBytes ≤ maxFileBytes`

A persistent-handle design **moves these from per-write to init + periodic re-check**. That window is the principal security trade-off and the reason this is medium-risk, not low-risk.

## Proposed Solution

Refactor `getQueuedFileWriter` / `safeAppendFile` in `src/agents/queued-file-writer.ts` to a stateful writer with three phases:

### Phase 1 — Init (1× per writer lifetime)

Run the full safety chain exactly as today:

- `assertNoSymlinkParents(filePath)`
- `lstat(filePath)` — refuse if symlink
- `open(filePath, O_NOFOLLOW | O_APPEND | O_CLOEXEC, 0o600)` → store `FileHandle`
- `handle.stat()` → store `{ dev, ino, nlink, size }` baseline
- `verifyStableOpenedFile(baseline)`
- `handle.chmod(0o600)`

Store in writer state:

```ts
{ handle, baseline: { dev, ino, nlink }, bytesWrittenSinceStat, buffer: Buffer[], dirty, debounceTimer }
```

### Phase 2 — Per-event write (hot path)

```ts
write(line) {
  buffer.push(Buffer.from(line))
  bytesWrittenSinceStat += line.length
  if (bytesWrittenSinceStat + baseline.size > maxFileBytes) {
    flushSync()  // budget enforcement before exceed
    return
  }
  scheduleDebouncedFlush()  // 100 ms window
}
```

Zero syscalls per event in the steady state. CPU cost is `Buffer.from` + queue push.

### Phase 3 — Flush (debounced or explicit)

```ts
async flush() {
  if (!buffer.length) return
  const combined = Buffer.concat(buffer); buffer.length = 0

  // Periodic re-check: every Nth flush OR if >RECHECK_INTERVAL_MS since last
  if (shouldRecheck()) {
    const live = await handle.stat()
    verifyStableOpenedFile(live, baseline)  // dev/ino/nlink/isFile
    bytesWrittenSinceStat = 0
  }

  await handle.appendFile(combined)
}
```

### Phase 4 — Close (run end / writer eviction)

```ts
async close() {
  clearTimeout(debounceTimer)
  await flush()
  await handle.close()
}
```

### Debounce/recheck tuning (initial defaults, env-overridable)

- `OPENCLAW_TRAJECTORY_FLUSH_DEBOUNCE_MS=100`
- `OPENCLAW_TRAJECTORY_RECHECK_EVERY_N_FLUSHES=10`
- `OPENCLAW_TRAJECTORY_RECHECK_INTERVAL_MS=5000` (whichever fires first)
- `OPENCLAW_TRAJECTORY_BATCH=1` (kill-switch; `0` reverts to per-event behavior)

### Important events bypass batching

`session.started`, `session.ended`, and any event with `data.critical === true` call `flushSync()` immediately. This bounds crash data loss to a debounce window of in-flight non-critical events only.

### Writer cache lifecycle changes

`writers` Map in `src/trajectory/runtime.ts:47` and `MAX_TRAJECTORY_WRITERS = 100` eviction in `trimTrajectoryWriterCache` (`runtime.ts:98-106`) currently just `.delete()`s entries. With persistent handles, eviction must `await writer.close()`. Convert to **LRU with TTL** (e.g., 10 min idle → close), and instrument `lsof` in dev to confirm FD count stays bounded.

## Solutions Considered (and rejected)

| Option                                                                | Why rejected                                                                                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Move trajectory write to a worker thread                              | New IPC overhead, message-port back-pressure complexity, doesn't reduce syscall count, harder cleanup ordering.                                             |
| Switch to append-only `fs.WriteStream`                                | Drops the `verifyStableOpenedFile` re-check entirely; weaker security than batched persistent handle.                                                       |
| Drop `assertNoSymlinkParents` to reduce per-write cost                | Loses a real defense (parent dir swap is plausible during long runs); only addresses ~30% of the cost.                                                      |
| Set `UV_THREADPOOL_SIZE=16`                                           | Treats symptom not cause; libuv pool sizing has memory/scheduling cost, doesn't reduce per-event syscall fan-out, masks regressions in other FS code paths. |
| Keep current per-event flush, only fix #2 (per-job concurrency lanes) | Doesn't lift the real concurrency cap; the underlying bottleneck remains and re-emerges at any future load increase.                                        |

## Implementation

### Step 1 — Extract pure helpers (no behavior change)

- `verifyStableOpenedFile(handle, baseline)` already exists; ensure it's exported as a standalone helper.
- Add `openTrajectoryHandle(filePath, opts) → { handle, baseline }` capturing init-phase logic.
- Tests: helper-level coverage for symlink/hardlink/permission cases (matches today's `queued-file-writer.test.ts` cases lines 21, 35, 50, 64, 75).

### Step 2 — Add stateful writer alongside existing function

- New class/factory `createBatchedFileWriter({ filePath, maxFileBytes, debounceMs, recheckEveryN, recheckIntervalMs })`.
- Old `safeAppendFile` stays as-is, used when `OPENCLAW_TRAJECTORY_BATCH=0`.
- Tests: batch coalescing, debounce timing, flush ordering, periodic re-check fires, size-budget enforcement on next flush, close idempotency.

### Step 3 — Wire `getQueuedFileWriter` to honor env switch

- When batch enabled, return adapter exposing the same `{ write, flush }` shape.
- `runtime.ts:151` `createTrajectoryRuntimeRecorder` unchanged; `flush` now closes/releases handle when `params.writer` is owned.

### Step 4 — Convert writer cache eviction to LRU+TTL with async close

- `trimTrajectoryWriterCache` becomes async-safe (queue close, don't block evict).
- Add idle-TTL sweeper (single setInterval at gateway level, not per-writer).

### Step 5 — Critical-event bypass

- `session.started`/`session.ended` paths in `recordEvent` call writer's `flushSync()` (or `flush()` awaited).
- Add `data.critical` flag passthrough.

### Step 6 — Benchmark + security review gate

- Local burst test: 5 synthetic agents × 100 events each, measure event-loop p99 + syscall count via `dtruss`/`strace` before/after.
- Security review: walk each defense from "Current safety guarantees" section, document recheck window in `docs/help/trajectory.md` (or wherever trajectory is documented).

### Step 7 — Rollout

- Land with `OPENCLAW_TRAJECTORY_BATCH=1` default in code, but document the kill-switch in changelog.
- After 7 days of clean p99 metrics in author's gateway, mark stable and remove old `safeAppendFile` path.

## Files to Modify

- `src/agents/queued-file-writer.ts` — primary refactor (~143 → ~280 LOC). Extract helpers, add batched writer, keep legacy path behind env switch.
- `src/agents/queued-file-writer.test.ts` — extend coverage; add 6–10 new cases (~150 LOC).
- `src/trajectory/runtime.ts` — wire `flush()` to close-when-owned; convert `trimTrajectoryWriterCache` to LRU+TTL+async-close (~15 LOC change at lines 47, 98–106, 215–220).
- `src/trajectory/runtime.test.ts` — eviction lifecycle, critical-event bypass.
- `src/agents/cache-trace.ts` — callsite audit (uses `getQueuedFileWriter`); should need 0 changes if API preserved.
- `src/agents/anthropic-payload-log.ts` — same audit.
- `src/agents/pi-embedded-runner/run/attempt.ts:3437-3454` — verify `pi-trajectory-flush` cleanup step still works; no functional change expected.
- `docs/help/trajectory.md` (or nearest existing doc) — document persistent-handle design, recheck window, env knobs.
- `CHANGELOG` — user-facing entry under `### Changes`.

## Testing

### Unit (pnpm test src/agents/queued-file-writer.test.ts)

- All existing 4 cases pass unchanged
- New: persistent handle reused across writes
- New: debounce coalesces N writes into 1 `appendFile`
- New: periodic re-check detects mid-run inode swap → throws/logs and refuses further writes
- New: size budget enforced at flush boundary, not violated mid-batch
- New: `close()` idempotent and flushes pending buffer
- New: `OPENCLAW_TRAJECTORY_BATCH=0` falls back to legacy per-event behavior

### Integration (pnpm test src/trajectory/runtime.test.ts)

- LRU+TTL eviction closes handle without dropping in-flight writes
- Critical-event bypass flushes synchronously
- Recorder `flush()` after eviction is no-op (not error)

### Performance proof

- Synthetic burst: 5 concurrent recorder instances × 100 events each
- Measure: event-loop p99 delay (via `perf_hooks.monitorEventLoopDelay`), syscall count (`dtruss -c -p <pid>` on macOS), wall time, RSS
- Target: p99 < 500 ms (matches current `maxConcurrentRuns: 2` baseline) at `maxConcurrentRuns: 5`

### Live gateway proof (post-merge, author's machine)

- Bump `cron.maxConcurrentRuns: 2 → 5`, restore staggered 5 jobs to original phase
- Remove `payload.trajectory: false` from 3–4 jobs, observe `cleanup timed out` count over 24 h (target: 0)
- Roll back if any regression

### Vitest discipline (per `src/agents/AGENTS.md`)

- `pnpm test src/agents/queued-file-writer.test.ts` — measure duration, RSS before/after
- `pnpm test:perf:imports src/agents/queued-file-writer.test.ts` — confirm no new heavy import
- `pnpm test:perf:hotspots --limit 20` — confirm no new hotspot

### Build proof (per `src/agents/AGENTS.md` lazy-loading rule)

- `pnpm build` after refactor; check no `[INEFFECTIVE_DYNAMIC_IMPORT]` warnings
- `pnpm check:import-cycles`
- `pnpm tsgo` for touched lanes

### Pre-handoff (per root `AGENTS.md`)

- `pnpm check:changed` in Testbox (broad gate fans out across many lanes)
- `pnpm test:changed` in Testbox
- Targeted local: `pnpm test src/agents/queued-file-writer.test.ts src/trajectory/runtime.test.ts`

## Dependencies

- No new npm dependencies. Uses existing `node:fs/promises`, `node:path`.
- Requires `pnpm config:docs:gen/check` only if env knobs are added to schema (likely not — they're operator-only env vars, not user config).
- Documentation update if `docs/help/` covers trajectory recording.
- No CODEOWNERS escalation needed (refactor + tests in `src/agents/`, `src/trajectory/`).

## Open Questions

1. **Should `OPENCLAW_TRAJECTORY_BATCH` be on by default in v0?** Recommendation: yes, with kill-switch documented. Behind a flag gives no proof.
2. **Recheck cadence — fixed N-flushes vs. time-based?** Plan says both (whichever first); validate with security reviewer.
3. **What constitutes a "critical event"?** Initial list: `session.started`, `session.ended`, errors. Validate by reading current `recordEvent` callsites for any event whose loss would prevent post-mortem reconstruction.
4. **FD pressure on macOS dev machines.** Author's gateway holds ~41 threads + sockets + plugin sidecars; need `lsof -p <pid> | wc -l` baseline before merge to confirm 100-writer cap × 1 handle each is safely under `ulimit -n`.

## Success Criteria

- `cron.maxConcurrentRuns: 5` sustained 24 h with 0 `cleanup timed out` warnings
- Event-loop p99 delay < 500 ms under that load
- Status connection queue wait < 1 s p99
- TUI cold-start latency unchanged or better (this plan does not address `bootstrap-context` prep stage)
- Zero regressions in trajectory file integrity (no truncated lines, no inode-swap false negatives in security tests)

## Related

- Sibling plan candidates (not in scope here):
  - **Per-job concurrency budget (light vs heavy lane)** — scheduling fix, complementary
  - **Bootstrap-context cache** — addresses prep-stage 19 s, the actual TUI latency dominant
- Knowledge: `~/.openclaw/workspace/knowledge/systems/cron-concurrency-tuning.md` (2026-05-04 update)
- Predecessor: `plans/2026-05-03_warm-fork-9899_add-trajectory-opt-out-field-to-cron-agentturn-payload.md`
- Backups before any rollout: `~/.openclaw/openclaw.json.bak-20260504-083218`, `~/.openclaw/cron/jobs.json.bak-20260504-083218`
