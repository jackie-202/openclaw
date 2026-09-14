// Preparation cancellation tests pin cooperative setup checkpoints before model dispatch.
import { describe, expect, it, vi } from "vitest";
import {
  makeIsolatedAgentTurnParams,
  setupRunCronIsolatedAgentTurnSuite,
} from "./run.suite-helpers.js";
import {
  ensureAgentWorkspaceMock,
  loadRunCronIsolatedAgentTurn,
  makeCronSession,
  resolveCronSessionMock,
  retireSessionMcpRuntimeMock,
  runWithModelFallbackMock,
  updateSessionStoreMock,
} from "./run.test-harness.js";

const runCronIsolatedAgentTurn = await loadRunCronIsolatedAgentTurn();

describe("isolated cron preparation cancellation", () => {
  setupRunCronIsolatedAgentTurnSuite();

  it("does not dispatch after a cancelled preparation await is released", async () => {
    let releaseWorkspace: (workspace: { dir: string }) => void = () => {};
    const workspace = new Promise<{ dir: string }>((resolve) => {
      releaseWorkspace = resolve;
    });
    const abort = new AbortController();
    ensureAgentWorkspaceMock.mockReturnValueOnce(workspace);

    const run = runCronIsolatedAgentTurn(
      makeIsolatedAgentTurnParams({ abortSignal: abort.signal }),
    );
    await vi.waitFor(() => expect(ensureAgentWorkspaceMock).toHaveBeenCalledOnce());

    abort.abort("cron: isolated agent setup timed out before runner start");
    releaseWorkspace({ dir: "/tmp/workspace" });

    await expect(run).resolves.toMatchObject({
      status: "error",
      error: "cron: isolated agent setup timed out before runner start",
    });
    expect(runWithModelFallbackMock).not.toHaveBeenCalled();
  });

  it("retires a rolled persistent session after cancelled persistence settles", async () => {
    let releasePersistence: () => void = () => {};
    const persistence = new Promise<void>((resolve) => {
      releasePersistence = resolve;
    });
    const abort = new AbortController();
    resolveCronSessionMock.mockReturnValue(
      makeCronSession({ previousSessionId: "previous-session", isNewSession: true }),
    );
    updateSessionStoreMock.mockReturnValueOnce(persistence);

    const run = runCronIsolatedAgentTurn(
      makeIsolatedAgentTurnParams({
        abortSignal: abort.signal,
        job: {
          sessionTarget: "session:persistent",
          payload: { kind: "agentTurn", message: "test" },
        },
      }),
    );
    await vi.waitFor(() => expect(updateSessionStoreMock).toHaveBeenCalledOnce());

    abort.abort("cron: isolated agent setup timed out before runner start");
    releasePersistence();

    await expect(run).resolves.toMatchObject({ status: "error" });
    expect(retireSessionMcpRuntimeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "previous-session",
        reason: "cron-session-rollover",
      }),
    );
    expect(runWithModelFallbackMock).not.toHaveBeenCalled();
  });

  it("reports bounded ordered stages during successful preparation", async () => {
    const progress: Array<{ stage: string; elapsedMs: number }> = [];

    await expect(
      runCronIsolatedAgentTurn(
        makeIsolatedAgentTurnParams({
          onSetupProgress: (entry: { stage: string; elapsedMs: number }) => progress.push(entry),
        }),
      ),
    ).resolves.toMatchObject({ status: "ok" });

    const stages = progress.map((entry) => entry.stage);
    expect(stages).toEqual(
      expect.arrayContaining(["workspace", "model-selection", "skills-snapshot"]),
    );
    expect(stages.indexOf("workspace")).toBeLessThan(stages.indexOf("model-selection"));
    expect(stages.indexOf("model-selection")).toBeLessThan(stages.indexOf("skills-snapshot"));
    expect(
      progress.every((entry) => Number.isInteger(entry.elapsedMs) && entry.elapsedMs >= 0),
    ).toBe(true);
    expect(runWithModelFallbackMock).toHaveBeenCalledOnce();
  });
});
