# Fix: manual cron trigger doesn't record run in history

## Problem

When a cron job is manually triggered (via `openclaw cron run <id>` or Mission Control UI), the run is NOT recorded in the job's run history. Only scheduled (automatic) runs appear in history.

This is a UX bug — manual triggers should leave a trace just like scheduled runs, including status, duration, summary, model used, etc.

## Expected behavior

- Manual trigger → run appears in cron job's history with `trigger: manual` (or similar marker)
- Mission Control "History" view shows the run like any other
- `openclaw cron runs --id <job-id>` lists the manual run

## Investigation

- Check where scheduled run history is written in the gateway codebase (likely in cron job execution handler)
- Check if manual trigger codepath skips that write, or if the run is recorded but not associated with the jobId

Project: /Users/michal/Projects/openclaw-fork
Plans output dir: /Users/michal/Projects/openclaw-fork/plans/
