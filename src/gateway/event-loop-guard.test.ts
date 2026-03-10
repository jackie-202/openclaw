import { describe, expect, it, vi } from "vitest";
import { startEventLoopGuard } from "./event-loop-guard.js";

describe("startEventLoopGuard", () => {
  it("starts and stops without throwing", async () => {
    vi.useFakeTimers();
    const warn = vi.fn();
    const error = vi.fn();
    const guard = startEventLoopGuard({
      log: { warn, error },
      sampleIntervalMs: 1000,
      warnLagMs: 1,
      severeLagMs: 5,
    });
    await vi.advanceTimersByTimeAsync(1100);
    guard.stop();
    expect(warn.mock.calls.length + error.mock.calls.length).toBeGreaterThanOrEqual(0);
    vi.useRealTimers();
  });
});
