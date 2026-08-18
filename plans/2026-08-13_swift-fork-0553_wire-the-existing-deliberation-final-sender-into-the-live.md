# Plan 2026-08-13: Wire the existing Deliberation final sender into the live plugin runtime

Register one plugin-owned service that injects the live Discord outbound adapter into the existing KM delivery adapter and serializes bounded queue ticks across startup, polling, and shutdown.

## Analysis

### Codebase Context

- `extensions/deliberation/index.ts:16` creates the live KM client but registers only hooks, Gateway methods, and CLI commands; `extensions/deliberation/src/plugin.test.ts:6` explicitly proves no service is currently registered.
- `extensions/deliberation/src/final-adapter.ts:56` already owns `ready -> reserve -> invoke -> provider.send -> completeDelivery`, including zero-send conflict/disabled outcomes and bounded failed-delivery evidence.
- `api.runtime.channel.outbound.loadAdapter("discord")` is the public generic provider boundary (`src/plugins/runtime/types-channel.ts:179`); its `sendText` accepts `cfg`, exact `accountId`, target, and text and returns message/receipt evidence (`src/channels/plugins/outbound.types.ts:21`, `src/channels/plugins/outbound.types.ts:232`).
- `api.registerService` supplies `start` and `stop` lifecycle ownership (`src/plugins/types.ts:2319`); sibling services clear timers in `stop`, but Deliberation also needs an in-flight latch and shutdown wait so interval ticks cannot overlap or outlive reload.
- `docs/plugins/reference/deliberation.md:10` and `docs/plugins/reference/deliberation.md:107` still state that outbound delivery is inactive and must change with runtime behavior.

### Relevant Documentation

- `docs/plugins/sdk-runtime.md:11` requires plugins to use injected runtime helpers rather than host internals.
- `docs/plugins/sdk-channel-outbound.md:14` keeps platform send authority, target normalization, and receipts in the channel plugin.
- `docs/plugins/hooks.md:464` requires explicit Gateway lifecycle cleanup for plugin-owned runtime services.
- `extensions/AGENTS.md:27` prohibits Deliberation from importing Discord plugin internals; no SDK or core contract expansion is needed.

### Knowledge Base

- `learnings/architecture/deliberation-final-delivery-two-public-contracts.md` requires KM-owned reservation/invocation state and a public account-bound provider seam; both are now present in `KmClient` and the generic outbound runtime adapter.
- Keep KM authoritative for reservation conflicts, sender disablement, idempotency, recovery, and terminal state. The runtime service only schedules `runOnce()` and catches loop-level failures.
- Knowledge lookup used local fallback because collection `openclaw-fork-learnings` was absent; diagnostic: `Collection not found: openclaw-fork-learnings`.

## Available Skills

- `tdd`: implement the characterization and RED/GREEN lifecycle tests first.
- `validate-implementation`: check the completed behavior against the task and plugin boundary.
- `save-learning`: record lifecycle/provider-boundary findings as the final implementation action.

## Approach

Use one `OpenClawPluginService` registered from `extensions/deliberation/index.ts`. Its provider wrapper lazily loads the Discord outbound adapter and performs one exact-account `sendText` call; its scheduler runs one adapter item per tick, ignores concurrent tick requests while one is in flight, catches/logs bounded loop errors, clears its timer on stop, and awaits the current tick before returning.

Do not add a second queue, retry protocol, config option, cron change, Discord-internal import, or KM compatibility path.

## Implementation

1. In `extensions/deliberation/src/plugin.test.ts`, preserve the current no-service assertion as characterization evidence, then replace it with a failing lifecycle test that captures the registered service and expects one startup/tick delivery through mocked KM and outbound boundaries.
2. Add a small scheduler/service constructor beside the existing adapter in `extensions/deliberation/src/final-adapter.ts`: fixed owner and poll interval, one-item `runOnce()`, one in-flight promise, `unref()` timer, bounded warning text, timer cleanup, and stop-time await. Do not change the KM transaction order.
3. In `extensions/deliberation/index.ts`, construct the provider from `api.runtime.channel.outbound.loadAdapter("discord")`; require `sendText`, target `channel:<channelId>`, pass `api.config` and the envelope account, and map the returned message/receipt identity to the adapter’s existing receipt shape. Register exactly one final-delivery service.
4. Extend `extensions/deliberation/src/plugin.test.ts` with fake-timer/service tests for startup registration, empty queue, sender disabled, reservation conflict, provider failure containment, repeated ticks, non-overlap, and stop/reload cleanup. Keep transaction-detail assertions in `final-adapter.test.ts` and add malformed-destination coverage there if absent.
5. Update `docs/plugins/reference/deliberation.md` to identify the Gateway plugin service as sender owner, describe exact-account Discord delivery, KM control/terminal authority, bounded polling, and restart/reload cleanup; remove inactive-sender statements.
6. Run focused Deliberation tests, extension typecheck, build, `git diff --check`, and `git diff --numstat`. Run `skill:validate-implementation`, then the mandatory `skill:save-learning` last. Record commands/results and `extensions/deliberation/index.ts` as the production owner in final task evidence.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/index.ts` | Inject Discord outbound provider and register one lifecycle service. |
| `extensions/deliberation/src/final-adapter.ts` | Add the bounded non-overlapping service runner around the existing sole adapter. |
| `extensions/deliberation/src/plugin.test.ts` | Characterize the missing runtime owner, then prove service lifecycle and tick behavior. |
| `extensions/deliberation/src/final-adapter.test.ts` | Fill adapter edge coverage only where lifecycle acceptance depends on it. |
| `docs/plugins/reference/deliberation.md` | Replace inactive-sender docs with live ownership and operation semantics. |

## TDD

Implement the TDD cycle with `skill:tdd`; save RED/GREEN evidence to `plans/checkpoints/swift-fork-0553.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/plugin.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts`

```ts
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { describe, expect, it, vi } from "vitest";
import plugin from "../index.js";

describe("deliberation final delivery lifecycle", () => {
  it("registers one final sender and releases it on stop", async () => {
    const registerService = vi.fn();
    plugin.register(
      createTestPluginApi({
        pluginConfig: validPluginConfig,
        registerService,
      }),
    );

    expect(registerService).toHaveBeenCalledTimes(1); // RED: no service is registered today.
    const service = registerService.mock.calls[0]?.[0];
    await service.start({ config: {}, stateDir: "/tmp", logger: testLogger });
    await service.stop({ config: {}, stateDir: "/tmp", logger: testLogger });
    expect(vi.getTimerCount()).toBe(0);
  });
});
```

The implementation should use the existing valid config fixture/helper names in this file when adding the executable test.

| Test | RED | GREEN |
| --- | --- | --- |
| one registered service with start/stop cleanup | `registerService` has zero calls | one service; stop leaves no timer or active tick |
| ready/reserved item | no runtime caller reaches `runOnce()` | ready, reserve, invoke, one `sendText`, complete `SENT` |
| empty/disabled/conflict | lifecycle is absent | zero provider calls |
| provider rejection/malformed destination | lifecycle is absent | bounded `FAILED`; tick promise does not reject |
| repeated ticks and reload | no scheduler exists | max concurrency one and one provider call per reservation |

## Verification

- `pnpm test extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts`
- `pnpm test extensions/deliberation`
- `pnpm tsgo:extensions`
- `pnpm build`
- `git diff --check`
- `git diff --numstat`

## Dependencies

- Existing `KmClient.ready/reserve/invoke/completeDelivery` contract remains unchanged.
- Existing Discord outbound adapter is loaded through `api.runtime`; no Discord package dependency or SDK expansion.
- No live KM, Discord credential, external workspace, cron, or spool access is required for implementation tests.

---
*Created: 2026-08-13*  
*Status: DRAFT*
