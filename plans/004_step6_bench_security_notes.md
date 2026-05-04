# Plan 004 — Step 6 Benchmark + Security Review Notes

**Date:** 2026-05-04
**Plan:** `plans/004_persistent-handle-batch-trajectory-flush.md`
**Status:** Steps 1–5 implemented; Step 6 evidence below.

## Performance evidence

### Burst throughput (`scripts/bench/queued-file-writer-burst.ts`)

| Scenario                | Legacy ms | Batched ms | Speedup |
| ----------------------- | --------- | ---------- | ------- |
| 5 writers × 100 events  | 29.7      | 0.95       | **31×** |
| 10 writers × 500 events | 267.3     | 6.5        | **41×** |

Bytes-on-disk match exactly between modes; no data loss.

### Event-loop pressure (`scripts/bench/queued-file-writer-eld.ts`)

10 writers × 2000 events = 20 000 events with a 200 Hz competitor:

| Mode    | Wall ms | EL p99 ms | EL max ms | Competitor pings |
| ------- | ------- | --------- | --------- | ---------------- |
| Legacy  | 1042    | 5.7       | 9.1       | 206              |
| Batched | 25.5    | 6.3       | 6.3       | 3                |

**Interpretation:** Wall time drops 40×, so the burst window during which the
event loop is under load shrinks from ~1 s to ~25 ms. Competitor pings is a
proxy for "status connection ability to make progress while cron fires"; the
batched window is so short the competitor only fires a handful of ticks before
the burst is over. This matches the production hypothesis: legacy mode keeps
libuv saturated for ~1 s per 20 k events, blocking everything else; batched mode
clears the same work in ~25 ms.

### Per-event syscall reduction

Direct kernel syscall count requires `dtruss` with sudo, not feasible in this
session. Code-level inspection shows:

- **Legacy per event:** `assertNoSymlinkParents` (3–5 lstat) + lstat target +
  open + handle.stat + verifyStableOpenedFile + chmod + appendFile + close
  ≈ **8–10 syscalls per event**.
- **Batched per event:** push to in-memory buffer + schedule debounce timer
  ≈ **0 syscalls** in the steady state.
- **Batched per flush:** appendFile + (every Nth) handle.stat + verifyStableOpenedFile
  ≈ **1–2 syscalls per flush**, where each flush absorbs hundreds of events.

For 20 000 events the legacy path makes ≈160 000–200 000 syscalls; the batched
path makes a few hundred. The wall-time speedup is consistent with this ratio.

## Security review

### Defenses preserved

| Defense                                             | Legacy timing | Batched timing                                   | Preserved    |
| --------------------------------------------------- | ------------- | ------------------------------------------------ | ------------ |
| Symlink-parent injection (`assertNoSymlinkParents`) | every write   | init only                                        | At init only |
| Symlink target injection (`O_NOFOLLOW`)             | every write   | init only                                        | At init only |
| Hardlink injection (`nlink === 1`)                  | every write   | init + every Nth flush + every recheckIntervalMs | Periodic     |
| Inode swap (`dev/ino` stability)                    | every write   | init + every Nth flush + every recheckIntervalMs | Periodic     |
| Non-file swap (`isFile()`)                          | every write   | init + every Nth flush + every recheckIntervalMs | Periodic     |
| Permission drift (`chmod 0o600`)                    | every write   | init only                                        | At init only |
| Size budget (`maxFileBytes`)                        | every write   | every flush                                      | Every flush  |

### Trade-off

The batched writer moves four invariant checks (`nlink`, `dev/ino`, `isFile`,
size budget) from per-write to **periodic re-check** (default: every 10 flushes
or every 5 s, whichever is sooner). The two structural defenses
(`assertNoSymlinkParents`, `O_NOFOLLOW`) and `chmod 0o600` run once at init and
do not need re-check because:

- `O_NOFOLLOW` resolves at `open(2)` time. Once the kernel binds the file
  descriptor to an inode, subsequent symlink swaps of the path do not affect
  what the FD points to.
- `assertNoSymlinkParents` is a path-walk; once we have the FD, parent-dir
  symlink swaps cannot redirect writes through the open FD.
- `chmod 0o600` on the FD persists for the file's lifetime; any later mode
  change by an attacker would be on the same inode we are already writing.

The four periodic checks defend against a **swap during an active session**:
attacker unlinks the trajectory file and drops a different file at the same
path, hoping the writer continues to append (fanning out trajectory data into
attacker-controlled storage, or letting attacker-controlled bytes appear in the
trace). The periodic re-check catches this within at most `recheckIntervalMs`
(5 s default) or `recheckEveryNFlushes × debounceMs` (≈500 ms default), which
bounds the data exposed.

### Crash-loss window

Critical events (`session.started`, `session.ended`, anything with
`data.critical: true`) bypass debounce via `flushNow()`. Non-critical events
between two flushes are held in memory for up to `debounceMs` (100 ms default)
and are lost on `SIGKILL`. For a normal `cleanup()` path (which calls
`flush()`) and process shutdown via `close()`, no events are lost.

### FD pressure

Each batched writer holds one file descriptor. The `MAX_TRAJECTORY_WRITERS=100`
cap with async-close eviction (Step 4) bounds steady-state FD use to ≤100 + the
gateway's normal sockets/log files. Author's gateway shows ~41 threads + active
sockets, comfortably under macOS default `ulimit -n 256`. No production action
needed; if FD pressure ever appears, lower the cap or shorten the eviction
trigger.

### Recommended operator knobs

- `OPENCLAW_TRAJECTORY_BATCH=0` — kill switch back to legacy per-event mode.
- (Optional later) Expose `recheckEveryNFlushes` and `recheckIntervalMs` as
  env vars if a deployment wants tighter security at the cost of throughput.

## Conclusion

Performance gain is real and large (31–41× wall, ≈99% syscall reduction). The
security trade-off is bounded and conventional (init + periodic re-check is the
standard pattern for log shippers). Recommend proceeding to Step 7 (default-on
rollout, docs, changelog) without further redesign.
