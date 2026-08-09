# Plan 2026-08-06: Fix Discord Provider Recovery After Network Outage

## Analysis

### Codebase Context

- `extensions/discord/src/channel.ts:675` owns per-account startup and reapplies the existing account-specific startup delay on every manager-created provider instance.
- `extensions/discord/src/monitor/provider.ts:390` constructs one client/gateway/supervisor per provider task; its `finally` delegates cleanup after the lifecycle returns or throws.
- `extensions/discord/src/monitor/provider.lifecycle.ts:326` waits for startup READY but currently reconnects the same gateway object without a terminal retry bound; this can keep the provider task alive indefinitely after a health-monitor restart instead of returning control for full reconstruction.
- `extensions/discord/src/monitor/provider.lifecycle.ts:408` already watches runtime reconnects and force-stops when an opened socket never reaches READY, but lifecycle-final cleanup does not itself guarantee a gateway disconnect when startup READY waiting throws.
- `extensions/discord/src/monitor/provider.cleanup.ts:11` disconnects only when lifecycle startup never began; after `lifecycleStarted = true`, teardown depends on the lifecycle path having disconnected.
- `src/gateway/channel-health-monitor.ts:160` correctly performs account-scoped `stopChannel(..., { manual: false })` then `startChannel(...)`; no Discord-specific policy belongs here.
- `src/gateway/server-channels.ts:428` owns task teardown/recreation, timeout handling, and bounded restart backoff independently per account.
- Existing focused coverage is in `extensions/discord/src/monitor/provider.lifecycle.test.ts`, with manager coordination covered by `src/gateway/server-channels.test.ts` and generic health decisions by `src/gateway/channel-health-monitor.test.ts`.

### Relevant Documentation

- `docs/channels/discord.md:1599` documents startup/runtime READY deadlines and multi-account overrides; update only if observable retry semantics or troubleshooting guidance changes.
- `extensions/AGENTS.md:26` requires Discord lifecycle behavior to remain plugin-owned and use Plugin SDK boundaries.
- `src/gateway/AGENTS.md:1` keeps generic gateway startup/health code plugin-agnostic.

### Knowledge Base

- Keep the fix at the Discord plugin lifecycle boundary; core health monitoring already provides generic account-scoped stop/start orchestration.
- Prove the real owning lifecycle path with a focused RED test, not only generic health-monitor mocks (`learnings/architecture/2026-08-02_acceptance-repair-plans-must-include-owner-implementation.md`).
- Preserve canonical single-owner behavior rather than adding a parallel reconnect path; the channel manager remains the owner of provider-instance recreation and backoff.
- Knowledge search used local fallback for collection `openclaw-fork-learnings` because the QMD collection was unavailable; unrelated routing/model learnings were excluded.

## Available Skills

- `tdd`: implement the lifecycle regression test RED-first and record RED/GREEN evidence.
- `openclaw-testing`: select the smallest repository-supported focused tests and changed-file gate.
- `autoreview`: run the mandatory fresh pre-handoff review after implementation and verification.
- `save-learning`: capture the lifecycle ownership/retry lesson after the implementation task.

## Approach

Allow one clean in-place gateway reconnect for a transient startup READY miss, then fail the Discord provider lifecycle if the replacement socket also misses READY. Always disconnect the lifecycle gateway during final cleanup so the channel manager can retire the stale client graph and recreate a fresh per-account provider through its existing bounded restart path.

## Implementation

1. Add a RED lifecycle test that keeps the gateway non-ready across the initial READY deadline and one clean reconnect; assert that no second in-place reconnect occurs, the lifecycle rejects with a terminal readiness error, and cleanup disconnects the gateway.
2. Bound `waitForGatewayReady` to the initial connection plus one clean gateway reconnect. On the second timeout, retain `connected: false`/`startup-not-ready`, throw to end the provider task, and avoid another `connect(false)` on the stale client.
3. Make `runDiscordGatewayLifecycle` finalization idempotently disconnect the gateway on every exit path before releasing registry/listener/voice/thread resources; log disconnect cleanup failures without masking the readiness failure.
4. Add account-qualified lifecycle logs for READY reached, clean reconnect started, runtime READY timeout forcing provider recreation, and terminal startup retry failure. Keep existing promoted websocket close/reconnect logs as the transport-level evidence.
5. Confirm `channel.ts` remains unchanged: each reconstructed account still passes through `resolveDiscordStartupDelayMs`, so `default` and `iris` recover independently without dropping startup staggering.

## Files to Modify

| File                                                        | Change                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `extensions/discord/src/monitor/provider.lifecycle.ts`      | Bound startup reconnects, guarantee gateway teardown, and add account-qualified recovery outcome logs. |
| `extensions/discord/src/monitor/provider.lifecycle.test.ts` | Cover terminal no-READY recovery, teardown, successful one-retry recovery, and log/status transitions. |

Do not change `src/gateway/channel-health-monitor.ts` or `src/gateway/server-channels.ts`; their generic per-account restart ownership and startup-delay call path already satisfy the required orchestration.

## TDD

Implement the RED/GREEN cycle with `skill:tdd` and record evidence in `plans/checkpoints/fresh-mist-4468.red-green-proof.md`.

**Test file:** `extensions/discord/src/monitor/provider.lifecycle.test.ts`  
**Run command:** `pnpm test extensions/discord/src/monitor/provider.lifecycle.test.ts`  
**Edit hint:** append inside the existing `describe("runDiscordGatewayLifecycle", ...)`; reuse its real `runDiscordGatewayLifecycle`, `createGatewayHarness`, and `createLifecycleHarness` setup.

```ts
it("returns control for provider recreation when a clean startup reconnect also misses READY", async () => {
  vi.useFakeTimers();
  const abortController = new AbortController();
  try {
    const { gateway } = createGatewayHarness();
    const { lifecycleParams, statusSink } = createLifecycleHarness({ gateway });
    lifecycleParams.abortSignal = abortController.signal;
    lifecycleParams.gatewayReadyTimeoutMs = 1_000;

    const lifecyclePromise = runDiscordGatewayLifecycle(lifecycleParams);
    lifecyclePromise.catch(() => {});
    await vi.advanceTimersByTimeAsync(4_500);

    // RED: current code starts a second in-place reconnect and remains pending.
    expect(gateway.connect).toHaveBeenCalledTimes(1);
    await expect(lifecyclePromise).rejects.toThrow(
      "discord gateway did not reach READY after clean reconnect",
    );
    expect(statusPatches(statusSink).at(-1)).toMatchObject({
      connected: false,
      lastError: "startup-not-ready",
    });
  } finally {
    abortController.abort();
    await vi.advanceTimersByTimeAsync(500);
    vi.useRealTimers();
  }
});
```

| Test                                     | RED                                                              | GREEN                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| clean reconnect also misses READY        | `gateway.connect` exceeds one call and lifecycle remains pending | one clean reconnect occurs, then lifecycle rejects and teardown completes |
| clean reconnect reaches READY            | existing recovery test remains green                             | lifecycle reaches connected status without provider recreation            |
| runtime reconnect opens but misses READY | existing force-stop test remains green                           | lifecycle disconnects and exits for manager-owned recreation              |
| account-qualified recovery logs          | expected phase/outcome messages are absent                       | close/error, retry start, READY, and terminal timeout are distinguishable |

## Verification

1. `pnpm test extensions/discord/src/monitor/provider.lifecycle.test.ts extensions/discord/src/monitor.gateway.test.ts extensions/discord/src/gateway-logging.test.ts`
2. `pnpm test src/gateway/channel-health-monitor.test.ts src/gateway/server-channels.test.ts`
3. Use `skill:openclaw-testing` to run the narrow changed-file type/lint gate selected for the final diff.
4. Run `git diff --check` and `git diff --numstat`; keep production growth limited to lifecycle ownership/logging changes.
5. Run `skill:autoreview` until no accepted actionable findings remain.

No dependency change is required: the Discord websocket/client implementation is repository-owned under `extensions/discord/src/internal/`, and the fix uses its existing `connect`, `disconnect`, `isConnected`, and socket lifecycle contract.

_Status: DRAFT_
_Created: 2026-08-06_
