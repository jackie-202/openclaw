---
title: "Cron run trigger propagation for history"
date: 2026-03-10
category: tooling
component: backend
tags: [cron, run-history, gateway, mission-control, compatibility]
---

# Cron run history needs explicit trigger propagation

When cron run history is persisted from service events, manual and scheduled runs look identical unless trigger origin is carried end-to-end.

## What worked

- Add a canonical `CronRunTrigger = "manual" | "scheduled"` type in `src/cron/types.ts`.
- Extend `CronEvent` in `src/cron/service/state.ts` with optional `trigger`.
- Emit `trigger: "manual"` in the manual run path (`src/cron/service/ops.ts`) and `trigger: "scheduled"` in timer completion (`src/cron/service/timer.ts`).
- Persist the event trigger into JSONL in `src/gateway/server-cron.ts`.
- Parse trigger defensively in `src/cron/run-log.ts` (accept only manual/scheduled; leave unknown values undefined).
- Expose trigger as optional in gateway schema + UI types and render it in Mission Control run chips.

## Important compatibility rule

Keep trigger optional everywhere (parser + schema + UI model). Existing historical run-log lines without `trigger` must remain valid and readable.

## Regression coverage pattern

- Gateway integration test should assert:
  - `cron.run` persisted entry has `trigger: "manual"`.
  - auto-scheduled execution has at least one `trigger: "scheduled"` entry.
- Run-log parser test should assert:
  - valid trigger is preserved.
  - unknown trigger value is ignored (parsed as undefined).

## Validation gotcha

`pnpm check` can fail from unrelated pre-existing formatting issues outside touched files. For this cron change, focused cron tests can still validate behavior while global formatting/lint debt is handled separately.
