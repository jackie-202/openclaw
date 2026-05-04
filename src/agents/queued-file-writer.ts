import nodeFs from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

export type QueuedFileWriter = {
  filePath: string;
  write: (line: string) => void;
  flush: () => Promise<void>;
};

export type QueuedFileWriterOptions = {
  maxFileBytes?: number;
};

type QueuedFileAppendFlagConstants = Pick<
  typeof nodeFs.constants,
  "O_APPEND" | "O_CREAT" | "O_WRONLY"
> &
  Partial<Pick<typeof nodeFs.constants, "O_NOFOLLOW">>;

export function resolveQueuedFileAppendFlags(
  constants: QueuedFileAppendFlagConstants = nodeFs.constants,
): number {
  const noFollow = constants.O_NOFOLLOW;
  return (
    constants.O_CREAT |
    constants.O_APPEND |
    constants.O_WRONLY |
    (typeof noFollow === "number" ? noFollow : 0)
  );
}

/**
 * Walk the parent directory chain and refuse if any segment is a symlink or
 * non-directory. Defends against symlink-injection on the path leading to the
 * trajectory file.
 *
 * Exported as a pure helper so the batched writer (Step 2) can reuse identical
 * init-phase logic without re-implementing it.
 */
export async function assertNoSymlinkParents(filePath: string): Promise<void> {
  const resolvedDir = path.resolve(path.dirname(filePath));
  const parsed = path.parse(resolvedDir);
  const relativeParts = path.relative(parsed.root, resolvedDir).split(path.sep).filter(Boolean);
  let current = parsed.root;
  for (const part of relativeParts) {
    current = path.join(current, part);
    const stat = await fs.lstat(current);
    if (stat.isSymbolicLink()) {
      if (path.dirname(current) === parsed.root) {
        continue;
      }
      throw new Error(`Refusing to write queued log under symlinked directory: ${current}`);
    }
    if (!stat.isDirectory()) {
      throw new Error(`Refusing to write queued log under non-directory: ${current}`);
    }
  }
}

/**
 * Verify an opened file handle still points at a stable, non-hardlinked, non-swapped
 * regular file. Throws if any invariant is violated.
 *
 * Exported as a pure helper so the batched writer (Step 2) can reuse it for both
 * init-time and periodic re-check.
 */
export function verifyStableOpenedFile(params: {
  preOpenStat?: nodeFs.Stats;
  postOpenStat: nodeFs.Stats;
  filePath: string;
}): void {
  if (!params.postOpenStat.isFile()) {
    throw new Error(`Refusing to write queued log to non-file: ${params.filePath}`);
  }
  if (params.postOpenStat.nlink > 1) {
    throw new Error(`Refusing to write queued log to hardlinked file: ${params.filePath}`);
  }
  const pre = params.preOpenStat;
  if (pre && (pre.dev !== params.postOpenStat.dev || pre.ino !== params.postOpenStat.ino)) {
    throw new Error(`Refusing to write queued log after file changed: ${params.filePath}`);
  }
}

/**
 * Stat a file path safely with symlink/non-file refusal. Returns the Stats if the
 * file exists, or undefined for ENOENT. Throws on symlink, non-file, or other errors.
 *
 * Exported as a pure helper so the batched writer (Step 2) can reuse pre-open inspection.
 */
export async function statFileForAppendOrUndefined(
  filePath: string,
): Promise<nodeFs.Stats | undefined> {
  try {
    const stat = await fs.lstat(filePath);
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing to write queued log through symlink: ${filePath}`);
    }
    if (!stat.isFile()) {
      throw new Error(`Refusing to write queued log to non-file: ${filePath}`);
    }
    return stat;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw err;
  }
}

/**
 * Open a queued-log file with the full safety chain: parent walk, pre-open lstat,
 * O_NOFOLLOW open, post-open verification, and chmod 0600. Returns the open handle
 * and the post-open Stats baseline (which the batched writer uses for periodic
 * re-check and for size-budget tracking).
 *
 * The legacy per-write `safeAppendFile` continues to call this for parity; the
 * batched writer (Step 2) calls it once at init and reuses the handle.
 */
export async function openQueuedAppendHandle(
  filePath: string,
): Promise<{ handle: fs.FileHandle; baseline: nodeFs.Stats; preOpenStat?: nodeFs.Stats }> {
  await assertNoSymlinkParents(filePath);
  const preOpenStat = await statFileForAppendOrUndefined(filePath);
  const handle = await fs.open(filePath, resolveQueuedFileAppendFlags(), 0o600);
  try {
    const postOpenStat = await handle.stat();
    verifyStableOpenedFile({ preOpenStat, postOpenStat, filePath });
    await handle.chmod(0o600);
    return { handle, baseline: postOpenStat, preOpenStat };
  } catch (err) {
    await handle.close().catch(() => undefined);
    throw err;
  }
}

export type BatchedFileWriterOptions = {
  maxFileBytes?: number;
  /** Debounce window in ms before pending writes flush. Default 100ms. */
  debounceMs?: number;
  /** Re-check file stability after every N flushes. Default 10. */
  recheckEveryNFlushes?: number;
  /** Re-check file stability if this many ms passed since last check. Default 5000. */
  recheckIntervalMs?: number;
  /** Test seam: override the timer scheduler. Defaults to setTimeout/clearTimeout. */
  scheduler?: {
    setTimeout: (fn: () => void, ms: number) => unknown;
    clearTimeout: (handle: unknown) => void;
  };
  /** Test seam: override the clock for recheck-interval decisions. Defaults to Date.now. */
  now?: () => number;
};

export type BatchedFileWriter = QueuedFileWriter & {
  /** Force immediate flush (skip debounce). Resolves once buffered writes hit disk. */
  flushNow: () => Promise<void>;
  /** Close the writer: cancel timer, flush pending, release file handle. Idempotent. */
  close: () => Promise<void>;
};

const DEFAULT_BATCH_DEBOUNCE_MS = 100;
const DEFAULT_BATCH_RECHECK_EVERY_N = 10;
const DEFAULT_BATCH_RECHECK_INTERVAL_MS = 5_000;

/**
 * Stateful, persistent-handle, debounced batched writer.
 *
 * Design (per plans/004_persistent-handle-batch-trajectory-flush.md):
 *   - Init: full safety chain runs once (parent walk, lstat, O_NOFOLLOW open,
 *     post-open verify, chmod 0600). Handle + baseline stat retained.
 *   - Per write: append Buffer to in-memory queue. Schedule debounced flush.
 *     Zero syscalls in the steady state.
 *   - Flush: single handle.appendFile(combinedBuffer). Periodically (every Nth
 *     flush OR after recheckIntervalMs) re-run verifyStableOpenedFile against
 *     a fresh handle.stat() to detect mid-run inode/hardlink/swap attacks.
 *   - Size budget: enforced at flush time. Pending events that would exceed
 *     maxFileBytes are dropped (matching legacy behavior of returning early).
 *   - Close: cancel timer, final flush, release handle. Idempotent.
 *   - Failure: any I/O or verification error transitions writer to "failed"
 *     state; subsequent writes are dropped silently (matching legacy
 *     fire-and-forget contract on QueuedFileWriter.write).
 */
export function createBatchedFileWriter(
  filePath: string,
  options: BatchedFileWriterOptions = {},
): BatchedFileWriter {
  const debounceMs = options.debounceMs ?? DEFAULT_BATCH_DEBOUNCE_MS;
  const recheckEveryN = options.recheckEveryNFlushes ?? DEFAULT_BATCH_RECHECK_EVERY_N;
  const recheckIntervalMs = options.recheckIntervalMs ?? DEFAULT_BATCH_RECHECK_INTERVAL_MS;
  const scheduler = options.scheduler ?? {
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
  };
  const now = options.now ?? Date.now;

  const dir = path.dirname(filePath);
  const ready = fs.mkdir(dir, { recursive: true, mode: 0o700 }).catch(() => undefined);

  let handle: fs.FileHandle | undefined;
  let baseline: nodeFs.Stats | undefined;
  let bytesOnDisk = 0;
  let initPromise: Promise<void> | undefined;
  let failed = false;

  const buffer: Buffer[] = [];
  let bufferedBytes = 0;
  let timer: unknown;
  /** Promise representing in-flight or pending flush; chains so flushes are serialized. */
  let flushChain: Promise<void> = Promise.resolve();
  let flushCount = 0;
  let lastRecheckAt = 0;
  let closed = false;

  async function ensureInitialized(): Promise<void> {
    if (handle || failed) {
      return;
    }
    if (!initPromise) {
      initPromise = (async () => {
        await ready;
        try {
          const opened = await openQueuedAppendHandle(filePath);
          handle = opened.handle;
          baseline = opened.baseline;
          bytesOnDisk = opened.baseline.size;
          lastRecheckAt = now();
        } catch {
          failed = true;
        }
      })();
    }
    await initPromise;
  }

  function cancelTimer(): void {
    if (timer !== undefined) {
      scheduler.clearTimeout(timer);
      timer = undefined;
    }
  }

  function scheduleFlush(): void {
    if (timer !== undefined || closed) {
      return;
    }
    timer = scheduler.setTimeout(() => {
      timer = undefined;
      // Fire-and-forget; flushNow chains internally.
      void flushNow();
    }, debounceMs);
  }

  async function performFlush(): Promise<void> {
    if (failed) {
      buffer.length = 0;
      bufferedBytes = 0;
      return;
    }
    // Empty buffer: do nothing. Critically, do NOT call ensureInitialized
    // here — it would create the file on disk just to flush nothing, which
    // surprises callers that called close() without ever writing.
    if (buffer.length === 0) {
      return;
    }
    await ensureInitialized();
    if (failed || !handle || !baseline) {
      buffer.length = 0;
      bufferedBytes = 0;
      return;
    }

    // Drain buffer into a single Buffer for one syscall.
    const drained = Buffer.concat(buffer, bufferedBytes);
    buffer.length = 0;
    bufferedBytes = 0;

    // Size budget: drop the entire batch if it would exceed cap.
    // (Matches legacy behavior of skipping writes once cap is reached.)
    if (options.maxFileBytes !== undefined && bytesOnDisk + drained.length > options.maxFileBytes) {
      return;
    }

    // Periodic re-check: detect mid-run inode swap, hardlink injection, or
    // file-type change against the persistent handle.
    flushCount += 1;
    const sinceRecheck = now() - lastRecheckAt;
    const shouldRecheck = flushCount % recheckEveryN === 0 || sinceRecheck >= recheckIntervalMs;
    if (shouldRecheck) {
      try {
        const live = await handle.stat();
        verifyStableOpenedFile({ preOpenStat: baseline, postOpenStat: live, filePath });
        lastRecheckAt = now();
      } catch {
        failed = true;
        await handle.close().catch(() => undefined);
        handle = undefined;
        return;
      }
    }

    try {
      await handle.appendFile(drained);
      bytesOnDisk += drained.length;
    } catch {
      failed = true;
      await handle.close().catch(() => undefined);
      handle = undefined;
    }
  }

  async function flushNow(): Promise<void> {
    cancelTimer();
    const next = flushChain.then(performFlush, performFlush);
    flushChain = next.catch(() => undefined);
    await next.catch(() => undefined);
  }

  async function close(): Promise<void> {
    if (closed) {
      // Wait for any in-flight flush from the close itself to settle.
      await flushChain.catch(() => undefined);
      return;
    }
    closed = true;
    cancelTimer();
    // Final flush: drain buffer before releasing handle. Use the chain so we
    // serialize behind any in-flight performFlush.
    const finalFlush = flushChain.then(performFlush, performFlush);
    flushChain = finalFlush.catch(() => undefined);
    await finalFlush.catch(() => undefined);
    if (handle) {
      await handle.close().catch(() => undefined);
      handle = undefined;
    }
  }

  return {
    filePath,
    write: (line: string) => {
      if (closed || failed) {
        return;
      }
      const lineBytes = Buffer.byteLength(line, "utf8");
      // Per-line budget short-circuit: if a single line already exceeds the cap
      // (relative to known on-disk size), drop it before queuing.
      if (
        options.maxFileBytes !== undefined &&
        bytesOnDisk + bufferedBytes + lineBytes > options.maxFileBytes
      ) {
        return;
      }
      buffer.push(Buffer.from(line, "utf8"));
      bufferedBytes += lineBytes;
      scheduleFlush();
    },
    flush: async () => {
      // QueuedFileWriter.flush contract: drain everything currently queued.
      await flushNow();
    },
    flushNow,
    close,
  };
}

async function safeAppendFile(
  filePath: string,
  line: string,
  options: QueuedFileWriterOptions,
): Promise<void> {
  await assertNoSymlinkParents(filePath);
  const preOpenStat = await statFileForAppendOrUndefined(filePath);
  const lineBytes = Buffer.byteLength(line, "utf8");
  if (
    options.maxFileBytes !== undefined &&
    (preOpenStat?.size ?? 0) + lineBytes > options.maxFileBytes
  ) {
    return;
  }

  const handle = await fs.open(filePath, resolveQueuedFileAppendFlags(), 0o600);
  try {
    const stat = await handle.stat();
    verifyStableOpenedFile({ preOpenStat, postOpenStat: stat, filePath });
    if (options.maxFileBytes !== undefined && stat.size + lineBytes > options.maxFileBytes) {
      return;
    }
    await handle.chmod(0o600);
    await handle.appendFile(line, "utf8");
  } finally {
    await handle.close();
  }
}

export function getQueuedFileWriter(
  writers: Map<string, QueuedFileWriter>,
  filePath: string,
  options: QueuedFileWriterOptions = {},
): QueuedFileWriter {
  const existing = writers.get(filePath);
  if (existing) {
    return existing;
  }

  const writer = isBatchedWriterEnabled()
    ? createBatchedFileWriter(filePath, { maxFileBytes: options.maxFileBytes })
    : createLegacyQueuedFileWriter(filePath, options);

  writers.set(filePath, writer);
  return writer;
}

/**
 * Env switch for the batched writer (Step 3 of plans/004).
 *
 * Default is ON. Operators can disable with `OPENCLAW_TRAJECTORY_BATCH=0` to
 * fall back to the legacy per-event flush path if a regression appears in
 * production. Recognized falsy values: `0`, `false`, `off`, `no` (case-insensitive).
 */
function isBatchedWriterEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env.OPENCLAW_TRAJECTORY_BATCH;
  if (raw === undefined) {
    return true;
  }
  const normalized = raw.trim().toLowerCase();
  if (
    normalized === "" ||
    normalized === "0" ||
    normalized === "false" ||
    normalized === "off" ||
    normalized === "no"
  ) {
    return false;
  }
  return true;
}

function createLegacyQueuedFileWriter(
  filePath: string,
  options: QueuedFileWriterOptions,
): QueuedFileWriter {
  const dir = path.dirname(filePath);
  const ready = fs.mkdir(dir, { recursive: true, mode: 0o700 }).catch(() => undefined);
  let queue = Promise.resolve();

  return {
    filePath,
    write: (line: string) => {
      queue = queue
        .then(() => ready)
        .then(() => safeAppendFile(filePath, line, options))
        .catch(() => undefined);
    },
    flush: async () => {
      await queue;
    },
  };
}

/**
 * Type guard for a writer that exposes `close()`. The batched writer always
 * does; the legacy writer does not.
 */
export function isClosableWriter(writer: QueuedFileWriter): writer is BatchedFileWriter {
  return (
    typeof (writer as { close?: unknown }).close === "function" &&
    typeof (writer as { flushNow?: unknown }).flushNow === "function"
  );
}

/**
 * Evict the oldest entries from a writer cache until size is below `cap`,
 * closing each evicted writer asynchronously to release its file handle.
 *
 * Closes are fire-and-forget by design: eviction must not block the caller's
 * critical path (typically a recordEvent on the hot path). Any close error is
 * swallowed; the legacy writer has no close and is dropped immediately.
 */
export function evictOldestWritersToCap(writers: Map<string, QueuedFileWriter>, cap: number): void {
  while (writers.size >= cap) {
    const oldestEntry = writers.entries().next();
    if (oldestEntry.done) {
      return;
    }
    const [oldestKey, oldestWriter] = oldestEntry.value;
    writers.delete(oldestKey);
    if (isClosableWriter(oldestWriter)) {
      // Fire and forget: do not block eviction on close I/O.
      void oldestWriter.close().catch(() => undefined);
    }
  }
}

/**
 * Sweep idle writers from a cache that have not been touched within the TTL.
 * Returns the number of writers evicted.
 *
 * Caller is expected to track `lastUsedAt` per writer (typically by wrapping
 * `write` and updating a sibling Map). This helper just evicts based on a
 * supplied predicate.
 */
export function evictIdleWriters(
  writers: Map<string, QueuedFileWriter>,
  isIdle: (filePath: string) => boolean,
): number {
  let evicted = 0;
  for (const [key, writer] of writers) {
    if (!isIdle(key)) {
      continue;
    }
    writers.delete(key);
    if (isClosableWriter(writer)) {
      void writer.close().catch(() => undefined);
    }
    evicted += 1;
  }
  return evicted;
}
