# Plan 2026-09-14: Deliberation Invocation Timeout Before Provider Send

_Status: DRAFT_

## Progress

- [x] Initialize canonical plan path
- [x] Inspect timeout and authorization contracts
- [x] Synthesize bounded repair and tests

## Analysis

### Codebase Context

- `extensions/deliberation/src/km-client.ts`: all six KM calls use `km.requestTimeoutMs`; `reserve` requests a 60-second lease; `invoke` posts durable invocation identity and accepts only an exact matching authorization response.
- `extensions/deliberation/src/final-adapter.ts`: `provider.send` is strictly after `km.invoke`; unknown provider results bypass completion; the service serializes ticks with `activeTick` and logs bounded KM operation/path/stage/cause diagnostics.
- `extensions/deliberation/src/config.ts` and `openclaw.plugin.json`: the sole current request budget is `km.requestTimeoutMs`, constrained to 100-30,000 ms in both runtime and manifest schema.
- `extensions/deliberation/src/final-adapter.test.ts`, `km-client.test.ts`, `delivery-composition.test.ts`, and `plugin.test.ts`: establish ordering, no-send fail-closed behavior, exact invocation evidence, native one-attempt behavior, and non-overlapping service ticks.

### Documentation And Knowledge

- `docs/plugins/reference/deliberation.md`: KM owns delivery state; the plugin makes one native attempt only after durable invocation and never retries an unknown provider outcome. Update this page if an operator-visible invocation budget is added.
- `docs/reference/test.md`: use `pnpm test <explicit target>` for focused local Vitest proof; `pnpm test extensions/deliberation` is the extension lane.
- Knowledge search used the local fallback because `openclaw-fork-learnings` was absent. The relevant rules require preserving external wire authority, treating absent producer timing evidence as a blocker rather than inventing it, and routing recovery only through the canonical reservation.

## Available Skills

- `tdd`: required RED/GREEN implementation cycle.
- `openclaw-testing`: choose focused repository test commands.
- `save-learning`: record the planning learning after finalizing this plan.

## Solution

- Keep the generic request budget for health, ready, intake, reserve, and completion. Add `km.invocationTimeoutMs` for only `invoke`, constrained to 100-30,000 ms and further capped by remaining reservation time. The recommended 30,000 ms accommodates the observed 13-second freshness read while retaining 30 seconds of the 60-second lease for authorization completion and the single provider call.
- Do not send when invoke times out, the response is lost/malformed/mismatched, or the lease cannot support the configured invoke window. A late authorization record is not evidence that a provider send occurred and must not trigger retry or completion.
- Use the incident's 13-second local fake authorization delay to prove the new invocation budget permits one validated send; retain the short generic request timeout to prove the fault and preserve bounded non-invocation calls.
- Before implementation, confirm from the pinned local contract/fixtures whether the producer publishes an invocation maximum. If absent, document the required producer contract: it must finish authorization and return the exact durable invocation response within the configured invocation budget while the reservation remains valid. Do not modify the producer or infer a retry-safe state.

## Implementation

1. Read the pinned `extensions/deliberation/contracts` invocation fixtures and existing service tests; record whether they state an authorization deadline. Keep the producer contract gap explicit if they do not.
2. Add RED tests with fake timers and an abort-aware fake fetch: a generic 5-second client request times out; an `/invocations` response delayed past 5 seconds but within its supported invocation budget returns exact authorization and causes one send/completion; capture the late authorization side effect without permitting a send on the timed-out path.
3. Refactor `km-client.ts` so `request` accepts a private per-operation timeout override. In `invoke`, calculate `min(km.invocationTimeoutMs, remainingLeaseMs)` from the parsed reservation expiry; reject before transport when the resulting budget is non-positive. Retain caller cancellation precedence and existing normalized `KmRequestError` transport metadata.
4. Add the explicit `km.invocationTimeoutMs` config surface. Constrain runtime schema and manifest identically to 100-30,000 ms, document 30,000 ms as the recommendation, and keep it below the 60-second reservation lifetime with a 30-second recovery margin. Do not raise the generic timeout globally.
5. Extend `final-adapter.test.ts` and composition/service coverage: authorization timeout/lost/malformed/mismatched response has zero sends; stale freshness/reservation conflict and concurrent ticks have zero duplicate sends; a valid delayed authorization sends once; provider unknown after authorization stays unresolved; a successful send whose completion response is lost does not make a second send.
6. Update `docs/plugins/reference/deliberation.md` only if the configuration surface changes: distinguish authorization transport timeout from provider-send uncertainty, recommend an invocation budget that fits the 60-second lease, and state that configuration/deployment restart is an operator action, not an automatic retry.
7. Record exact commands, changed files, RED/GREEN results, producer-contract status, and the limitation that mocked transports prove ordering only, not real provider delivery.

## Files To Modify

| File                                                       | Change                                                                                                    |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/km-client.ts`                 | Add the bounded invocation-only request budget and preserve fail-closed timeout diagnostics.              |
| `extensions/deliberation/src/config.ts`                    | Validate the explicit invocation budget if the existing generic budget cannot express the safe split.     |
| `extensions/deliberation/openclaw.plugin.json`             | Mirror any runtime config schema change.                                                                  |
| `extensions/deliberation/src/km-client.test.ts`            | Characterize short generic timeout and delayed invocation authorization with fake time/transport.         |
| `extensions/deliberation/src/final-adapter.test.ts`        | Assert no speculative provider call and exactly-one-send paths.                                           |
| `extensions/deliberation/src/delivery-composition.test.ts` | Cover the assembled service/native-provider boundary and lost completion no-retry behavior.               |
| `extensions/deliberation/src/config.test.ts`               | Assert runtime/manifest bounds and rejection of unsafe invocation budgets.                                |
| `docs/plugins/reference/deliberation.md`                   | Document the operator-facing budget and phase-specific fail-closed diagnostics, if configuration changes. |

## TDD

**Implement using `skill:tdd`; record RED/GREEN evidence in `plans/checkpoints/task-190873da-d25c-46f1-87c0-4782fde68765.red-green-proof.md`.**

**Target files:** `extensions/deliberation/src/km-client.test.ts`, `extensions/deliberation/src/final-adapter.test.ts`, `extensions/deliberation/src/delivery-composition.test.ts`, and `extensions/deliberation/src/config.test.ts`.

**Focused command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/config.test.ts`

```ts
// Append to km-client.test.ts; this must fail before the invoke-specific budget exists.
it("waits for a delayed matching invocation authorization without extending health requests", async () => {
  vi.useFakeTimers();
  const fetchImpl = vi.fn(
    (_input: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("", "AbortError")), {
          once: true,
        });
        setTimeout(
          () => resolve(new Response(JSON.stringify(validInvocationResponse()), { status: 200 })),
          13_000,
        );
      }),
  );
  const client = createKmClient({
    config: {
      ...config,
      km: { ...config.km, requestTimeoutMs: 5_000, invocationTimeoutMs: 30_000 },
    },
    openclawConfig: {} as never,
    fetchImpl,
    env: { KM_TOKEN: "test-only" },
  });

  const invocation = client.invoke(validReservation(), "provider:attempt-1");
  await vi.advanceTimersByTimeAsync(13_000);
  await expect(invocation).resolves.toMatchObject({ attemptId: "attempt-1" });
});
```

| Test                                       | RED before implementation                                                     | GREEN after implementation                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| delayed valid invoke                       | current shared 5-second abort rejects before the 13-second fake authorization | exact invocation response resolves; adapter sends and completes once                    |
| generic timeout                            | existing short request behavior remains                                       | health/ready timeout remains a `KmRequestError` with `stage=transport`, `cause=timeout` |
| timed-out/lost/malformed/mismatched invoke | no adapter recovery may authorize a send                                      | zero sends and no completion                                                            |
| stale/reservation conflict/concurrent tick | invalid or overlapping work must not reach a provider                         | zero duplicate sends                                                                    |
| provider unknown/lost completion           | post-send uncertainty remains unresolved                                      | one provider call and no speculative second attempt                                     |

## Dependencies

- All proof is local isolated fake transport/provider time; no live configuration, deployment, restart, message, record mutation, or replay is authorized.
- Existing local wire fixtures prove response shape and immutable evidence, not a producer authorization latency SLA. A producer change is unnecessary only if its owner confirms the configured budget covers synchronous freshness authorization within the live reservation; otherwise the implementation stops with that precise contract requirement.
- If configuration changes, operators must set the new budget and restart/reload through their normal deployment process; no automatic replay/requeue is part of this repair.
