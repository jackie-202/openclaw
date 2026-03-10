# Plan 011: Fix Manual Cron Trigger History Recording

Ensure manually triggered cron runs are persisted and visible in run history, and label run origin so manual vs scheduled executions are distinguishable in API + UI.

_Status: DRAFT_
_Created: 2026-03-10_

## Goals

- Guarantee manual runs (`cron.run`, CLI `openclaw cron run`, Mission Control Run action) are recorded in the same run log stream as scheduled runs.
- Add explicit run origin metadata (`trigger: manual|scheduled`) to each persisted run entry.
- Surface trigger metadata in Mission Control History and `cron.runs` payloads without breaking existing consumers.
- Add regression coverage that fails if manual runs are skipped or misclassified.

## Problem

Manual cron executions are expected to appear in job history, but current behavior reports only scheduled runs in history views. Users lose traceability for ad-hoc/diagnostic executions.

## Analysis

### Current execution and logging flow

- Manual execution enters `CronService.run()` via `src/cron/service/ops.ts` and emits a `finished` event.
- Scheduled execution flows through timer execution in `src/cron/service/timer.ts` and also emits a `finished` event.
- Persistent history is written in gateway event hook (`src/gateway/server-cron.ts`) by listening to `onEvent` and appending JSONL entries via `appendCronRunLog(...)`.
- Run log entry schema currently has no trigger/origin field (`src/cron/run-log.ts`, `src/gateway/protocol/schema/cron.ts`, `ui/src/ui/types.ts`).

### Gap identified

- There is no first-class origin marker to distinguish manual vs scheduled runs.
- Manual history visibility depends entirely on the same event-path persistence, but there is no explicit contract/test that manual runs must serialize with origin metadata and be queryable immediately from `cron.runs`.

## Approach

1. Introduce a typed run-trigger field across cron event + run-log models.
2. Emit `trigger: manual` from manual run codepath (`ops.run`) and `trigger: scheduled` from timer-driven path.
3. Persist/read/validate this field in run-log and gateway protocol schemas.
4. Render trigger in Mission Control history UI (chip/badge) so manual runs are visibly traceable.
5. Add regression tests for manual + scheduled persistence and marker correctness.

## File Changes

### 1) `src/cron/types.ts`

Add canonical trigger type for run origin.

```diff
--- a/src/cron/types.ts
+++ b/src/cron/types.ts
@@
 export type CronRunStatus = "ok" | "error" | "skipped";
+export type CronRunTrigger = "manual" | "scheduled";
```

### 2) `src/cron/service/state.ts`

Extend `CronEvent` payload to carry trigger metadata.

```diff
--- a/src/cron/service/state.ts
+++ b/src/cron/service/state.ts
@@
 import type {
   CronDeliveryStatus,
   CronJob,
+  CronRunTrigger,
   ...
 } from "../types.js";
@@
 export type CronEvent = {
   jobId: string;
   action: "added" | "updated" | "removed" | "started" | "finished";
+  trigger?: CronRunTrigger;
   ...
 };
```

### 3) `src/cron/service/ops.ts`

Mark manual runs explicitly on finished emit.

```diff
--- a/src/cron/service/ops.ts
+++ b/src/cron/service/ops.ts
@@
     emit(state, {
       jobId: job.id,
       action: "finished",
+      trigger: "manual",
       status: coreResult.status,
       ...
     });
```

### 4) `src/cron/service/timer.ts`

Mark timer-driven runs as scheduled (including catch-up/auto execution paths).

```diff
--- a/src/cron/service/timer.ts
+++ b/src/cron/service/timer.ts
 @@
 function emitJobFinished(...){
   emit(state, {
     jobId: job.id,
     action: "finished",
+    trigger: "scheduled",
     status: result.status,
     ...
   });
 }
```

### 5) `src/cron/run-log.ts`

Persist + parse trigger field in JSONL run entries.

```diff
--- a/src/cron/run-log.ts
+++ b/src/cron/run-log.ts
 @@
 export type CronRunLogEntry = {
   ts: number;
   jobId: string;
   action: "finished";
+  trigger?: "manual" | "scheduled";
   status?: CronRunStatus;
   ...
 } & CronRunTelemetry;
@@
 const entry: CronRunLogEntry = {
   ts: obj.ts,
   jobId: obj.jobId,
   action: "finished",
+  trigger:
+    obj.trigger === "manual" || obj.trigger === "scheduled" ? obj.trigger : undefined,
   ...
 };
```

### 6) `src/gateway/server-cron.ts`

Copy event trigger into persisted run-log entry.

```diff
--- a/src/gateway/server-cron.ts
+++ b/src/gateway/server-cron.ts
 @@
 void appendCronRunLog(logPath, {
   ts: Date.now(),
   jobId: evt.jobId,
   action: "finished",
+  trigger: evt.trigger,
   status: evt.status,
   ...
 });
```

### 7) `src/gateway/protocol/schema/cron.ts`

Expose trigger in RPC response schema for `cron.runs`.

```diff
--- a/src/gateway/protocol/schema/cron.ts
+++ b/src/gateway/protocol/schema/cron.ts
 @@
+const CronRunTriggerSchema = Type.Union([
+  Type.Literal("manual"),
+  Type.Literal("scheduled"),
+]);
@@
 export const CronRunLogEntrySchema = Type.Object({
   ...
+  trigger: Type.Optional(CronRunTriggerSchema),
   ...
 });
```

### 8) `ui/src/ui/types.ts`

Add trigger to UI run entry model.

```diff
--- a/ui/src/ui/types.ts
+++ b/ui/src/ui/types.ts
 @@
 export type CronRunLogEntry = {
   ts: number;
   jobId: string;
+  trigger?: "manual" | "scheduled";
   ...
 };
```

### 9) `ui/src/ui/views/cron.ts`

Render trigger chip in run-history row.

```diff
--- a/ui/src/ui/views/cron.ts
+++ b/ui/src/ui/views/cron.ts
 @@
+function runTriggerLabel(value?: "manual" | "scheduled") {
+  return value === "manual" ? "Manual" : "Scheduled";
+}
@@
 <div class="chip-row" style="margin-top: 6px;">
+  <span class="chip">${runTriggerLabel(entry.trigger)}</span>
   <span class="chip">${delivery}</span>
   ...
 </div>
```

### 10) Tests to update/add

- `src/gateway/server.cron.test.ts`
  - assert manual `cron.run` entries include `trigger: "manual"`.
  - assert auto-run entries include `trigger: "scheduled"`.
- `src/cron/run-log.test.ts`
  - parse/roundtrip coverage for `trigger` field.
- `src/gateway/protocol/cron-validators.test.ts` (if schema snapshots/strict payload checks exist)
  - validate trigger acceptance in run-log entries.
- `ui/src/ui/views/cron.test.ts`
  - verify trigger marker is rendered in history rows.

## Implementation Notes

- Keep `trigger` optional in parser/schema for backward compatibility with existing historical JSONL lines.
- Do not rewrite existing run-log files; new entries will include trigger and old entries will render with default/implicit scheduled label.
- Preserve current `cron.runs` query/filter behavior (no new filter parameter in this change).

## Test Strategy

1. Gateway integration regression:
   - Add job, invoke `cron.run` force, fetch `cron.runs --id`, assert latest entry has `trigger: manual`.
2. Scheduled regression:
   - Add due job, let scheduler execute, fetch history, assert at least one entry has `trigger: scheduled`.
3. Log parser compatibility:
   - Read fixtures without trigger and with trigger, ensure both parse cleanly.
4. UI rendering check:
   - Render run list item with manual + scheduled fixtures and assert chip text appears.
5. Optional smoke:
   - Run `openclaw cron run <id>` then `openclaw cron runs --id <id>` and verify manual trigger appears.

## Dependencies

- No new external dependencies.
- Touches shared protocol/UI types; keep backend and UI schema/type updates in same change.

---

_Created: 2026-03-10_
_Status: DRAFT_
