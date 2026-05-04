// Verifies queued file writes keep append logs bounded and symlink-safe.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createBatchedFileWriter,
  getQueuedFileWriter,
  resolveQueuedFileAppendFlags,
} from "./queued-file-writer.js";

const tempDirs: string[] = [];

function makeTempDir(): string {
  // Real temp dirs let symlink and permission checks exercise filesystem behavior.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-queued-writer-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("getQueuedFileWriter", () => {
  // The original tests cover the legacy per-event safeAppendFile contract.
  // Pin them to legacy mode so they exercise that code path explicitly.
  const originalEnv = process.env.OPENCLAW_TRAJECTORY_BATCH;
  beforeEach(() => {
    process.env.OPENCLAW_TRAJECTORY_BATCH = "0";
  });
  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.OPENCLAW_TRAJECTORY_BATCH;
    } else {
      process.env.OPENCLAW_TRAJECTORY_BATCH = originalEnv;
    }
  });

  it("keeps append flags usable when O_NOFOLLOW is unavailable", () => {
    expect(
      resolveQueuedFileAppendFlags({
        O_APPEND: 0x01,
        O_CREAT: 0x02,
        O_WRONLY: 0x04,
      }),
    ).toBe(0x07);
  });

  it("creates log files with restrictive permissions", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const writer = getQueuedFileWriter(new Map(), filePath);

    writer.write("line\n");
    await writer.flush();

    expect(fs.readFileSync(filePath, "utf8")).toBe("line\n");
    expect(fs.statSync(filePath).mode & 0o777).toBe(0o600);
  });

  it("refuses to append through a symlink", async () => {
    const tmpDir = makeTempDir();
    const targetPath = path.join(tmpDir, "target.txt");
    const filePath = path.join(tmpDir, "trace.jsonl");
    fs.writeFileSync(targetPath, "before\n", "utf8");
    fs.symlinkSync(targetPath, filePath);
    const writer = getQueuedFileWriter(new Map(), filePath);

    writer.write("after\n");
    await writer.flush();

    expect(fs.readFileSync(targetPath, "utf8")).toBe("before\n");
  });

  it("refuses to append through a symlinked parent directory", async () => {
    // Parent directory symlinks are as dangerous as leaf-file symlinks.
    const tmpDir = makeTempDir();
    const targetDir = path.join(tmpDir, "target");
    const linkDir = path.join(tmpDir, "link");
    fs.mkdirSync(targetDir);
    fs.symlinkSync(targetDir, linkDir);
    const writer = getQueuedFileWriter(new Map(), path.join(linkDir, "trace.jsonl"));

    writer.write("after\n");
    await writer.flush();

    expect(fs.existsSync(path.join(targetDir, "trace.jsonl"))).toBe(false);
  });

  it("stops appending when the configured file cap is reached", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const writer = getQueuedFileWriter(new Map(), filePath, { maxFileBytes: 6 });

    writer.write("12345\n");
    writer.write("after\n");
    await writer.flush();

    expect(fs.readFileSync(filePath, "utf8")).toBe("12345\n");
  });

  it("drops writes that would exceed the pending queue cap", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const writer = getQueuedFileWriter(new Map(), filePath, { maxQueuedBytes: 6 });

    expect(writer.write("12345\n")).toBe("queued");
    expect(writer.write("after\n")).toBe("dropped");
    await writer.flush();

    expect(fs.readFileSync(filePath, "utf8")).toBe("12345\n");
  });

  it("reports pending queue diagnostics before flush drains writes", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const writer = getQueuedFileWriter(new Map(), filePath, {
      maxFileBytes: 1024,
      maxQueuedBytes: 1024,
      yieldBeforeWrite: true,
    });

    writer.write("line\n");

    expect(writer.describeQueue?.()).toEqual({
      pendingWrites: 1,
      queuedBytes: 5,
      activeOperation: "idle",
      activeWriteBytes: undefined,
      maxFileBytes: 1024,
      maxQueuedBytes: 1024,
      yieldBeforeWrite: true,
    });

    await writer.flush();

    expect(writer.describeQueue?.()).toMatchObject({
      pendingWrites: 0,
      queuedBytes: 0,
      activeOperation: "idle",
    });
  });
});

/**
 * Manual scheduler for batched writer tests. Does not auto-fire timers; tests
 * call `runPending()` to drive the debounce clock deterministically.
 */
function makeManualScheduler() {
  type Task = { fn: () => void; id: number };
  let nextId = 1;
  const tasks = new Map<number, Task>();
  return {
    scheduler: {
      setTimeout: (fn: () => void, _ms: number) => {
        const id = nextId++;
        tasks.set(id, { fn, id });
        return id;
      },
      clearTimeout: (handle: unknown) => {
        if (typeof handle === "number") {
          tasks.delete(handle);
        }
      },
    },
    pending: () => tasks.size,
    runPending: () => {
      const snapshot = [...tasks.values()];
      tasks.clear();
      for (const task of snapshot) {
        task.fn();
      }
    },
  };
}

describe("createBatchedFileWriter", () => {
  it("coalesces multiple writes into a single appendFile syscall via debounce", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const ctrl = makeManualScheduler();
    const writer = createBatchedFileWriter(filePath, { scheduler: ctrl.scheduler });

    writer.write("a\n");
    writer.write("b\n");
    writer.write("c\n");
    expect(fs.existsSync(filePath)).toBe(false);
    expect(ctrl.pending()).toBe(1); // single debounce timer for the batch

    ctrl.runPending();
    await writer.flush();

    expect(fs.readFileSync(filePath, "utf8")).toBe("a\nb\nc\n");
    await writer.close();
  });

  it("reuses the persistent handle across many writes (no per-write re-open)", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const ctrl = makeManualScheduler();
    const writer = createBatchedFileWriter(filePath, {
      scheduler: ctrl.scheduler,
      // Disable periodic re-check for this test so we observe pure batch behavior.
      recheckEveryNFlushes: 1_000_000,
      recheckIntervalMs: 1_000_000,
    });

    for (let i = 0; i < 50; i++) {
      writer.write(`line-${i}\n`);
    }
    ctrl.runPending();
    await writer.flush();

    const contents = fs.readFileSync(filePath, "utf8");
    expect(contents.split("\n").filter(Boolean)).toHaveLength(50);
    await writer.close();
    // Inode should be unchanged across writes (handle never rotated).
    expect(fs.statSync(filePath).nlink).toBe(1);
  });

  it("flushes pending writes on close", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const ctrl = makeManualScheduler();
    const writer = createBatchedFileWriter(filePath, { scheduler: ctrl.scheduler });

    writer.write("only-on-close\n");
    // Do NOT runPending: simulate process shutting down before debounce fires.
    await writer.close();

    expect(fs.readFileSync(filePath, "utf8")).toBe("only-on-close\n");
  });

  it("close() is idempotent and safe to call concurrently", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const writer = createBatchedFileWriter(filePath);

    writer.write("x\n");
    await Promise.all([writer.close(), writer.close(), writer.close()]);
    // Second/third close must not throw and must not produce duplicate writes.
    expect(fs.readFileSync(filePath, "utf8")).toBe("x\n");
  });

  it("drops writes silently after a failure (matches fire-and-forget contract)", async () => {
    const tmpDir = makeTempDir();
    // Point at a path under a non-directory parent to force init failure.
    const blocker = path.join(tmpDir, "not-a-dir");
    fs.writeFileSync(blocker, "i am a file\n");
    const filePath = path.join(blocker, "trace.jsonl");

    const writer = createBatchedFileWriter(filePath);
    writer.write("attempt\n");
    await writer.flush();

    // No file should be created and no throw should escape the writer.
    expect(fs.existsSync(filePath)).toBe(false);
    await writer.close();
  });

  it("refuses to follow a symlink at the target path (init-time)", async () => {
    const tmpDir = makeTempDir();
    const targetPath = path.join(tmpDir, "target.txt");
    const filePath = path.join(tmpDir, "trace.jsonl");
    fs.writeFileSync(targetPath, "before\n", "utf8");
    fs.symlinkSync(targetPath, filePath);

    const writer = createBatchedFileWriter(filePath);
    writer.write("after\n");
    await writer.flush();

    expect(fs.readFileSync(targetPath, "utf8")).toBe("before\n");
    await writer.close();
  });

  it("enforces maxFileBytes at flush boundary (drops oversize batches)", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const ctrl = makeManualScheduler();
    const writer = createBatchedFileWriter(filePath, {
      scheduler: ctrl.scheduler,
      maxFileBytes: 10,
    });

    writer.write("12345\n"); // 6 bytes — fits
    ctrl.runPending();
    await writer.flush();

    writer.write("67890\n"); // 6 more bytes → 12 total → exceeds 10 → drop batch
    ctrl.runPending();
    await writer.flush();

    expect(fs.readFileSync(filePath, "utf8")).toBe("12345\n");
    await writer.close();
  });

  it("drops a single oversize line before buffering it", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const ctrl = makeManualScheduler();
    const writer = createBatchedFileWriter(filePath, {
      scheduler: ctrl.scheduler,
      maxFileBytes: 5,
    });

    writer.write("this-line-is-way-too-long\n");
    expect(ctrl.pending()).toBe(0); // no flush scheduled because line was rejected
    ctrl.runPending();
    await writer.flush();

    expect(fs.existsSync(filePath)).toBe(false);
    await writer.close();
  });

  it("re-checks file stability after recheckEveryNFlushes and detects swap", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const ctrl = makeManualScheduler();
    const writer = createBatchedFileWriter(filePath, {
      scheduler: ctrl.scheduler,
      recheckEveryNFlushes: 2, // re-check on the 2nd flush
      recheckIntervalMs: 1_000_000,
    });

    // First flush: opens handle, writes, no recheck (count=1).
    writer.write("one\n");
    ctrl.runPending();
    await writer.flush();
    expect(fs.readFileSync(filePath, "utf8")).toBe("one\n");

    // Swap the file out from under the open handle: unlink and recreate.
    // The persistent handle still points at the original (now-unlinked) inode,
    // and `handle.stat()` will report different dev/ino than baseline.
    fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, "tampered\n");

    // Second flush triggers recheck (count=2 % 2 === 0). Because dev/ino
    // changed (or nlink invariant broke for the unlinked inode), the writer
    // must transition to failed and stop writing — the new on-disk file must
    // remain "tampered\n", with no append from this batch.
    writer.write("two\n");
    ctrl.runPending();
    await writer.flush();

    expect(fs.readFileSync(filePath, "utf8")).toBe("tampered\n");

    // Subsequent writes must also be silently dropped.
    writer.write("three\n");
    ctrl.runPending();
    await writer.flush();
    expect(fs.readFileSync(filePath, "utf8")).toBe("tampered\n");

    await writer.close();
  });

  it("re-checks based on recheckIntervalMs even when flush count has not reached N", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const ctrl = makeManualScheduler();
    let fakeNow = 1_000_000;
    const writer = createBatchedFileWriter(filePath, {
      scheduler: ctrl.scheduler,
      recheckEveryNFlushes: 1_000_000,
      recheckIntervalMs: 100,
      now: () => fakeNow,
    });

    writer.write("first\n");
    ctrl.runPending();
    await writer.flush();
    expect(fs.readFileSync(filePath, "utf8")).toBe("first\n");

    // Advance the clock past recheckIntervalMs and tamper.
    fakeNow += 200;
    fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, "tampered\n");

    writer.write("second\n");
    ctrl.runPending();
    await writer.flush();

    // Recheck must have fired due to elapsed time → writer detects swap and stops.
    expect(fs.readFileSync(filePath, "utf8")).toBe("tampered\n");
    await writer.close();
  });

  it("creates the file with 0600 permissions on init", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const ctrl = makeManualScheduler();
    const writer = createBatchedFileWriter(filePath, { scheduler: ctrl.scheduler });

    writer.write("p\n");
    ctrl.runPending();
    await writer.flush();

    expect(fs.statSync(filePath).mode & 0o777).toBe(0o600);
    await writer.close();
  });
});

describe("getQueuedFileWriter env switch", () => {
  const originalEnv = process.env.OPENCLAW_TRAJECTORY_BATCH;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.OPENCLAW_TRAJECTORY_BATCH;
    } else {
      process.env.OPENCLAW_TRAJECTORY_BATCH = originalEnv;
    }
  });

  it("uses the batched writer by default (env unset)", async () => {
    delete process.env.OPENCLAW_TRAJECTORY_BATCH;
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const writer = getQueuedFileWriter(new Map(), filePath);
    // Batched writer exposes flushNow and close; legacy does not.
    expect("close" in writer).toBe(true);

    writer.write("batched\n");
    await writer.flush();
    expect(fs.readFileSync(filePath, "utf8")).toBe("batched\n");
    if ("close" in writer) {
      await (writer as { close: () => Promise<void> }).close();
    }
  });

  it("falls back to the legacy writer when OPENCLAW_TRAJECTORY_BATCH=0", async () => {
    process.env.OPENCLAW_TRAJECTORY_BATCH = "0";
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const writer = getQueuedFileWriter(new Map(), filePath);
    expect("close" in writer).toBe(false);

    writer.write("legacy\n");
    await writer.flush();
    expect(fs.readFileSync(filePath, "utf8")).toBe("legacy\n");
  });

  it("treats `false`, `off`, `no` as disabled (case-insensitive)", async () => {
    for (const raw of ["false", "FALSE", "off", "No"]) {
      process.env.OPENCLAW_TRAJECTORY_BATCH = raw;
      const tmpDir = makeTempDir();
      const filePath = path.join(tmpDir, `trace-${raw}.jsonl`);
      const writer = getQueuedFileWriter(new Map(), filePath);
      expect("close" in writer).toBe(false);
      writer.write(`${raw}\n`);
      await writer.flush();
      expect(fs.readFileSync(filePath, "utf8")).toBe(`${raw}\n`);
    }
  });

  it("reuses cached writer instance regardless of mode", async () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "trace.jsonl");
    const map = new Map();
    const a = getQueuedFileWriter(map, filePath);
    const b = getQueuedFileWriter(map, filePath);
    expect(a).toBe(b);
    if ("close" in a) {
      await (a as { close: () => Promise<void> }).close();
    }
  });
});
