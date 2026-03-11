# Plan 013: Gateway Session Lane Priority for Interactive Responsiveness

Keep interactive user messages responsive even when cron jobs or subagent completion retries are active, without introducing concurrent writes to the same session.

_Status: DRAFT_
_Created: 2026-03-11_

## Goals

- Guarantee that interactive messages (TUI, WhatsApp, other direct user ingress) are not starved behind background work in the same session lane.
- Preserve single-writer safety per session (no concurrent run execution for one session transcript).
- Bound retry/time-budget for subagent completion announces so retries cannot hold a session lane for minutes.
- Reduce operator ambiguity by exposing queue pressure/blocked-lane signal when waits exceed threshold.
- Keep behavior backward-compatible for existing RPC clients and persisted cron/subagent state.

## Problem

Observed behavior shows FIFO session-lane scheduling (`session:agent:main:main`) allows low-urgency background work to occupy the lane while interactive user messages wait 7+ minutes. The lane is currently serialized with no priority differentiation.

Concrete starvation chain:

1. A long-running cron-triggered run occupies the session lane.
2. Subagent completion announce retries enqueue more work targeting the same requester session.
3. Interactive message arrives and joins queue tail.
4. FIFO ordering drains background queue first; user-visible responsiveness collapses.

## Analysis

### Relevant code paths

- `src/process/command-queue.ts`
  - Core lane queue implementation is FIFO (`queue: QueueEntry[]`, `shift()`), with no priority class.
  - Wait warnings are logged, but no explicit event distinguishes starvation cause.
- `src/agents/pi-embedded-runner/run.ts`
  - Every run is serialized by `sessionLane = resolveSessionLane(sessionKey)` before global lane.
  - This protects transcript consistency, but mixes interactive and background work in one FIFO.
- `src/commands/agent.ts`
  - Ingress path currently forwards `lane` to global lane but not session-lane priority.
  - Interactive vs background intent exists indirectly (`inputProvenance`, trigger, spawned flows).
- `src/agents/subagent-registry.ts`
  - Cleanup announce flow uses `SUBAGENT_ANNOUNCE_TIMEOUT_MS = 120_000` and retry loop (`MAX_ANNOUNCE_RETRY_COUNT = 3`).
  - Worst-case retry windows still create multi-minute pressure.
- `src/agents/subagent-announce.ts` + `src/agents/subagent-announce-worker.ts` + `src/gateway/announce-transport.ts`
  - Announce traffic sends `agent` RPC to requester session; currently no explicit session-priority hint on that path.

### Constraint: avoid separate concurrent session lanes

Using physically separate lanes for interactive/background per session can accidentally allow concurrent runs on one session, risking transcript/order corruption. Safer approach: keep one session lane lock, add priority queues inside that lane.

### Learnings applied

- `learnings/runtime-errors/gateway-bounded-announce-retries-deferred-delivery.md`
  - Keep in-band delivery bounded; retries must not dominate run budget.
- `learnings/tooling/rules-gateway-announce-delivery-bounded-retry-async-fallback.md`
  - Reuse existing delivery primitives, preserve idempotency, and avoid long synchronous retry chains.
- `learnings/tooling/cron-run-trigger-propagation-history.md`
  - Keep new fields optional/backward-compatible in schema and logs.

## Approach

Implement a **hybrid** solution:

1. **Session-lane priority scheduling** (interactive > background) inside the same lane state.
2. **Background classification at ingress** using provenance/trigger, propagated to embedded runner enqueue.
3. **Retry circuit-breaker tightening** for subagent announce cleanup/worker to cap total stall impact.
4. **Queue-pressure visibility** via structured diagnostics and optional UI surface.

This addresses A + C + D, while avoiding B's concurrency risk.

## File Changes (planned)

### 1) `src/process/command-queue.ts`

Add priority-aware queue internals per lane while preserving `maxConcurrent` behavior.

```diff
--- a/src/process/command-queue.ts
+++ b/src/process/command-queue.ts
@@
-type QueueEntry = {
+type CommandPriority = "interactive" | "background";
+type QueueEntry = {
   task: () => Promise<unknown>;
   ...
+  priority: CommandPriority;
 };
@@
-type LaneState = { queue: QueueEntry[]; ... }
+type LaneState = {
+  interactiveQueue: QueueEntry[];
+  backgroundQueue: QueueEntry[];
+  ...
+};
@@
-const entry = state.queue.shift()
+const entry = state.interactiveQueue.shift() ?? state.backgroundQueue.shift()
```

Pseudocode:

```ts
function enqueueCommandInLane(lane, task, opts) {
  const priority = opts?.priority ?? "interactive";
  (priority === "interactive" ? state.interactiveQueue : state.backgroundQueue).push(entry);
}

function queuedCount(state) {
  return state.interactiveQueue.length + state.backgroundQueue.length + state.activeTaskIds.size;
}
```

Additional behavior:

- Keep non-preemptive semantics (running task is not interrupted).
- Add starvation guard for background work (optional aging promotion after threshold) only if needed after baseline tests.
- Extend wait warning context with queue composition (`interactiveAhead`, `backgroundAhead`).

### 2) `src/process/command-queue.test.ts`

Add/adjust tests:

- interactive task enqueued after background task starts waiting runs first once current active task completes.
- background tasks still drain eventually.
- `clearCommandLane` clears both priority queues.
- queue size helpers still report totals correctly.

### 3) `src/agents/pi-embedded-runner/run/params.ts`

Add optional queue-priority hint propagated from caller.

```diff
 export type RunEmbeddedPiAgentParams = {
   ...
+  queuePriority?: "interactive" | "background";
 }
```

### 4) `src/agents/pi-embedded-runner/run.ts`

Apply queue priority at session-lane enqueue point.

```diff
 return enqueueSession(
   () => enqueueGlobal(async () => { ... }),
+  { priority: params.queuePriority ?? "interactive" }
 )
```

### 5) `src/commands/agent.ts`

Derive queue priority from request intent/provenance.

Planned rule set:

- `interactive`: external user ingress (`inputProvenance.kind === "external_user"` or missing provenance from direct channel message).
- `background`: inter-session/system sources such as subagent announce (`sourceTool === "subagent_announce"`), cron/system-initiated calls.

```diff
+const queuePriority = resolveQueuePriority({ trigger: opts.trigger, inputProvenance: opts.inputProvenance })
 return runEmbeddedPiAgent({
   ...
+  queuePriority,
 })
```

### 6) `src/gateway/protocol/schema/agent.ts` and `src/gateway/announce-transport.ts`

Optional propagation field for explicit background classify from announce transport.

```diff
 AgentParamsSchema = Type.Object({
   ...
+  queuePriority: Type.Optional(Type.String({ enum: ["interactive", "background"] })),
 })
```

and

```diff
 await callGateway({
   method: "agent",
   params: {
     ...,
+    queuePriority: "background",
   }
 })
```

Note: keep optional for compatibility with existing callers.

### 7) `src/agents/subagent-registry.ts`

Tighten announce cleanup retry budget and timeout defaults to prevent long lock occupancy.

```diff
-const SUBAGENT_ANNOUNCE_TIMEOUT_MS = 120_000;
+const SUBAGENT_ANNOUNCE_TIMEOUT_MS = 15_000;
-const MAX_ANNOUNCE_RETRY_COUNT = 3;
+const MAX_ANNOUNCE_RETRY_COUNT = 2;
+const MAX_ANNOUNCE_TOTAL_RETRY_WINDOW_MS = 30_000;
```

Pseudocode:

```ts
if (now - firstAnnounceAttemptAt > MAX_ANNOUNCE_TOTAL_RETRY_WINDOW_MS) {
  giveUp("expiry")
}
```

### 8) `src/agents/subagent-announce-worker.ts`

Reduce per-attempt timeout and retries for queued completion sends to avoid long synchronous lane pressure.

```diff
-const MAX_RETRIES = 8;
+const MAX_RETRIES = 4;
...
-{ timeoutMs: 30_000 }
+{ timeoutMs: 15_000 }
```

All queued announce sends should carry `queuePriority: "background"`.

### 9) Queue pressure diagnostics surface

Files likely touched:

- `src/process/command-queue.ts`
- `src/logging/diagnostic.ts`
- `src/infra/diagnostic-events.ts`

Add explicit event for wait-threshold exceed with queue composition so TUI/clients can render clear "busy, not dead" state.

```ts
emitDiagnosticEvent({
  type: "queue.lane.wait_exceeded",
  lane,
  waitedMs,
  interactiveAhead,
  backgroundAhead,
})
```

If no current TUI wiring consumes this stream, phase this as diagnostics-only first, then UI hook-up in follow-up.

## Implementation Steps

1. Introduce queue priority primitives in `command-queue` with full unit coverage.
2. Thread queue-priority option through embedded runner params and agent command path.
3. Mark subagent announce and cron/system-initiated agent sends as background priority.
4. Tighten subagent announce retry/timeout budgets with bounded total window.
5. Emit queue-wait diagnostic events for observability; optionally expose in TUI health panel.
6. Validate with targeted starvation regression tests and existing cron/subagent suites.

## Test Strategy

### Unit

- `src/process/command-queue.test.ts`
  - FIFO within same priority.
  - interactive dequeues before background under contention.
  - queue clear/size/active counts remain correct.
- `src/commands/agent.test.ts`
  - provenance -> queuePriority mapping.
- `src/agents/subagent-registry*.test.ts`
  - retry budget give-up paths with new timeout/attempt caps.
- `src/agents/subagent-announce-worker.test.ts` (new/extended)
  - worker uses background priority and bounded timeout/retry.

### Integration

- Add starvation regression test that enqueues:
  1) long background task,
  2) additional background retries,
  3) interactive user task,
  and asserts interactive task runs before queued background retries.
- Cron + subagent flow tests ensuring completion semantics remain valid when retries are cut earlier.

### Manual verification

- Reproduce with a cron job + forced announce timeout conditions.
- Send TUI/WhatsApp interactive message while background retries are queued.
- Confirm interactive message execution starts quickly (seconds, not minutes) and lane diagnostics reflect queue composition.

## Risks and Mitigations

- Risk: misclassification of legitimate user-originated messages as background.
  - Mitigation: conservative default to `interactive`; only classify explicit inter-session/system provenance as background.
- Risk: background starvation after introducing priority.
  - Mitigation: add aging/promotion guard if tests reveal starvation; monitor queue metrics.
- Risk: behavior changes for older clients.
  - Mitigation: new schema fields optional; server defaults unchanged when field absent.
- Risk: reduced retry budgets lower eventual delivery rate in flaky networks.
  - Mitigation: rely on durable queue worker + idempotency, not long in-band blocking.

## Dependencies

- No new third-party dependencies expected.
- Relies on existing `agent` RPC optional-field compatibility and current subagent announce queue worker.

---

_Status: DRAFT_
