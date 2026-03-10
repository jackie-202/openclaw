# Plan 012: Gateway Stability - Announce Delivery Resilience and Event Loop Protection

Increase reliability of cron/subagent completion delivery when the gateway is under load, and add first-class event loop stall detection so freezes are visible and diagnosable without manual guesswork.

_Status: DRAFT_
_Created: 2026-03-10_

## Goals

- Prevent completed cron/subagent results from being lost when a direct gateway WS announce attempt times out.
- Decouple announce retry/backoff from the cron job wall-clock budget so successful agent turns do not fail due to transient delivery path stalls.
- Reduce per-delivery gateway connection/auth overhead (connect + challenge + connect RPC) during bursty completion traffic.
- Add gateway event loop stall monitoring (warn-level and severe-level thresholds) with actionable logs.
- Preserve backward compatibility for existing cron run history and delivery semantics.

## Problem

Under concurrent load, direct announce delivery to `ws://127.0.0.1:18789` timed out repeatedly (`gateway timeout after 60000ms`). Cron execution then hit its overall timeout budget, even though the agent turn itself had already finished successfully. Recovery required manual gateway restart.

The current path is sensitive to gateway event-loop stalls because each announce delivery can require a fresh WS handshake + auth. Retry behavior is currently coupled to request timeout and can consume most of a cron run budget.

## Analysis

### Relevant code paths

- `src/cron/isolated-agent/delivery-dispatch.ts`
  - Cron isolated agent completion routes through `runSubagentAnnounceFlow(...)`.
  - In announce mode, failures may fall back to direct outbound, but delivery is still in-band with the run.
- `src/agents/subagent-announce.ts`
  - Direct delivery uses `callGateway({ method: "agent", expectFinal: true })` with transient retry delays.
  - Each `callGateway` call constructs a fresh `GatewayClient` and handshake path.
- `src/gateway/call.ts` + `src/gateway/client.ts`
  - Per-call WS client lifecycle with timeout guard and connect challenge flow.
- `src/config/sessions/store.ts`
  - Uses sync file read/JSON parse in hot paths (`loadSessionStore`); under large stores and contention this is a plausible event-loop pressure source.
- `src/gateway/server.impl.ts` + `src/gateway/server-maintenance.ts`
  - Gateway long-running timers are centralized here; this is the natural location for event-loop health monitor lifecycle.

### Existing resilience primitives to leverage

- In-memory announce queue and retry behavior already exist (`src/agents/subagent-announce-queue.ts`) but are not durable across process stalls/restarts and are conditional on requester activity.
- Durable outbound queue exists for channel payloads (`src/infra/outbound/delivery-queue.ts`) and provides a good persistence/recovery pattern.

### Learnings applied

- `learnings/tooling/cron-run-trigger-propagation-history.md`
  - Keep new persisted metadata backward-compatible and optional in parsers/schemas.
  - Add integration tests on event persistence boundaries.
- `learnings/tooling/task-lifecycle-review-phase-state-consistency.md`
  - Preserve explicit state transitions and avoid collapsing intermediate states under retry/reconciliation.

## Approach

1. Introduce a dedicated announce delivery queue for completion messages (durable, retryable, independent of cron run timeout).
2. Switch completion delivery flow to fast-attempt + enqueue-on-failure instead of long in-band retry chains.
3. Add a lightweight shared/persistent gateway announce transport for repeated completion sends to avoid connect-per-delivery overhead.
4. Add event loop lag monitoring in gateway runtime with warning/severe thresholds and periodic snapshots.
5. Extend cron delivery status reporting so queued-not-yet-delivered is explicit in logs/history.

## File Changes

### 1) `src/agents/subagent-announce.ts`

Refactor direct completion delivery to use a reusable announce transport and bounded fast-attempt behavior.

```diff
--- a/src/agents/subagent-announce.ts
+++ b/src/agents/subagent-announce.ts
@@
-const DIRECT_ANNOUNCE_TRANSIENT_RETRY_DELAYS_MS = [5000, 10000, 20000]
+const DIRECT_ANNOUNCE_FAST_RETRY_DELAYS_MS = [750, 2000, 5000]
+const DIRECT_ANNOUNCE_MAX_IN_BAND_MS = 15_000
@@
-await runAnnounceDeliveryWithRetry({ run: () => callGateway(...) })
+const deliveryResult = await runCompletionDirectWithBudget({
+  timeoutBudgetMs: DIRECT_ANNOUNCE_MAX_IN_BAND_MS,
+  signal,
+  send: () => announceTransport.sendAgentRequest(...),
+})
+if (!deliveryResult.delivered) {
+  await enqueueCompletionAnnounce({ ...payload, error: deliveryResult.error })
+  return { delivered: false, path: "queued" }
+}
```

Pseudocode notes:
- Keep current permanent vs transient error classification.
- Only keep short in-band retries; hand off long-tail retries to queue worker.
- Preserve current `expectsCompletionMessage` semantics and idempotency key usage.

### 2) `src/agents/subagent-announce-delivery-queue.ts` (new)

Add durable queue for completion announce delivery attempts (JSON entries in state dir).

```ts
type QueuedAnnounce = {
  id: string
  enqueuedAt: number
  retryCount: number
  requesterSessionKey: string
  triggerMessage: string
  directOrigin?: DeliveryContext
  completionDirectOrigin?: DeliveryContext
  idempotencyKey: string
  bestEffortDeliver?: boolean
  lastError?: string
}

enqueueAnnounceDelivery(...)
loadPendingAnnounceDeliveries(...)
ackAnnounceDelivery(...)
failAnnounceDelivery(...)
recoverPendingAnnounceDeliveries(...)
```

Implementation should mirror robustness patterns from `src/infra/outbound/delivery-queue.ts`.

### 3) `src/agents/subagent-announce-worker.ts` (new)

Background worker draining durable announce queue with exponential backoff and jitter.

```ts
startSubagentAnnounceDeliveryWorker({ cfg, log, transport })
// - bounded concurrency (default 1)
// - respects abort/close on gateway shutdown
// - retries transient errors
// - moves permanent failures to failed/ bucket
```

### 4) `src/cron/isolated-agent/delivery-dispatch.ts`

Treat queued completion announce as a successful "delivery accepted for async transport" state (distinct from immediate delivered).

```diff
--- a/src/cron/isolated-agent/delivery-dispatch.ts
+++ b/src/cron/isolated-agent/delivery-dispatch.ts
@@
-if (didAnnounce) delivered = true
+if (didAnnounce) {
+  delivered = true
+} else if (announceQueuedForRetry) {
+  deliveryAttempted = true
+  deliveryDeferred = true
+}
```

Add `deliveryDeferred` propagation in returned run result so cron history can show "queued/deferred".

### 5) `src/cron/types.ts`, `src/cron/service/state.ts`, `src/gateway/server-cron.ts`, `src/cron/run-log.ts`

Add optional delivery-deferred status metadata to run log/event payloads (backward-compatible).

```diff
export type CronDeliveryStatus =
  | "not-requested"
  | "unknown"
  | "not-delivered"
  | "delivered"
+ | "deferred";
```

Persist optional fields:
- `deliveryDeferred?: boolean`
- `deliveryErrorLast?: string`

Parser must accept missing fields for historical log lines.

### 6) `src/gateway/announce-transport.ts` (new)

Shared persistent gateway client for announce send operations (pool of 1 by default).

```ts
class AnnounceTransport {
  start(): void
  stop(): void
  async sendAgentRequest(params, opts): Promise<void>
  // internal: lazy connect, backoff reconnect, serialized requests
}
```

Design constraints:
- Reuse handshake-authenticated WS session for sequential sends.
- If socket unhealthy, fail fast and let queue worker retry.
- Keep idempotency key on every request.

### 7) `src/gateway/event-loop-guard.ts` (new)

Add event loop lag monitor using `node:perf_hooks`.

```ts
startEventLoopGuard({
  log,
  sampleIntervalMs: 5000,
  warnLagMs: 100,
  severeLagMs: 1000,
  reportUtilization: true,
})
// logs p50/p95/p99/max lag and event loop utilization deltas
```

Behavior:
- warn when p99 > `warnLagMs`
- error when max > `severeLagMs`
- include correlation fields (queue depth, session store count if cheaply available)

### 8) `src/gateway/server.impl.ts` and `src/gateway/server-maintenance.ts`

Wire lifecycle for:
- announce worker/transport startup and shutdown
- event loop guard startup and shutdown

```diff
--- a/src/gateway/server.impl.ts
+++ b/src/gateway/server.impl.ts
@@
+const eventLoopGuard = startEventLoopGuard(...)
+const announceWorker = startSubagentAnnounceDeliveryWorker(...)
@@
  close: async () => {
+   await announceWorker.stop()
+   eventLoopGuard.stop()
    ...
  }
```

### 9) `src/config/types.gateway.ts`, `src/config/zod-schema.ts`, `src/config/schema.help.ts`, `src/config/schema.labels.ts`

Add optional gateway tuning block:

```ts
gateway: {
  eventLoopGuard?: {
    enabled?: boolean
    sampleIntervalMs?: number
    warnLagMs?: number
    severeLagMs?: number
  }
  announceDelivery?: {
    maxInBandMs?: number
    workerConcurrency?: number
  }
}
```

Defaults should keep behavior safe without explicit config.

### 10) Tests

- `src/agents/subagent-announce.timeout.test.ts`
  - verify fast in-band retry budget and enqueue-on-failure path.
- `src/agents/subagent-announce-dispatch.test.ts`
  - add completion mode assertions for deferred/queued result state.
- `src/agents/subagent-announce-queue.test.ts`
  - extend for durable queue recovery semantics.
- `src/cron/service.*.test.ts` and/or `src/gateway/server.cron.test.ts`
  - verify cron run status persists deferred delivery metadata.
- `src/gateway/event-loop-guard.test.ts` (new)
  - threshold logging behavior from synthetic lag samples.
- `src/gateway/server-maintenance.test.ts`
  - ensure guard lifecycle starts/stops cleanly.

## Implementation Notes

- Prefer additive, optional schema fields for run log compatibility.
- Avoid blocking operations inside guard sampling callbacks; monitor must be near-zero overhead.
- Keep failure-mode semantics explicit:
  - `delivered=true`: immediate confirmed send
  - `deliveryDeferred=true`: accepted into retry queue
  - `not-delivered`: exhausted/failed without queue
- Do not rely on gateway restart for retry recovery; recovery should happen automatically on next worker tick/start.

## Test Strategy

1. Unit tests for announce retry budget:
   - direct call times out -> entry is queued quickly (without consuming full cron timeout).
2. Worker recovery test:
   - queued entry survives process restart and is delivered on recovery pass.
3. Cron integration test:
   - agent turn completes, announce path unavailable -> run ends `ok` with deferred delivery metadata.
4. Event loop guard unit tests:
   - lag below threshold -> no warn
   - lag above warn/severe thresholds -> structured warning/error emitted.
5. Gateway-level smoke test:
   - under synthetic announce burst, verify lower connect churn and no delivery loss.

## Risks and Mitigations

- Risk: duplicate user-facing completion messages after retry.
  - Mitigation: preserve idempotency keys across queued retries; keep dedupe at delivery edge.
- Risk: queue growth under prolonged gateway failure.
  - Mitigation: bounded retries + failed bucket + explicit metrics/logging.
- Risk: monitor noise in busy environments.
  - Mitigation: threshold tuning + sampled logging cadence.

## Dependencies

- No new third-party dependencies required.
- Depends on existing gateway WS protocol and current `agent` RPC behavior.

---

_Created: 2026-03-10_
_Status: DRAFT_
