# Fix: link-plan.py fails to link plan when task was retried

## Problem

When a planning task is launched multiple times (e.g. first attempt fails due to permission error),
only the FIRST attempt's task ID ends up in `opencode-tasks.json`. Each retry creates a new
session ID (and a new log file `/tmp/opencode-<newSessionId>.log`), but the task record keeps
the original `planSessionId` from the first attempt.

Result: `link-plan.py` looks for `Write plans/` in the first (failed) log — finds nothing —
returns `no_match`.

Real-world example:
- Task `warm-crag-7790` had `planSessionId = warm-crag-7790`
- First run failed (permission reject, no plan written)
- Second run used session `bold-peak-8835` (also failed — plan source file missing)
- Third run used session `cool-brook-9802` — **succeeded**, wrote `plans/008_*.md`
- But `planSessionId` was never updated → `link-plan.py` couldn't find the plan

## Root Cause

`start-task.sh` uses the SESSION_ID (= first attempt) as the planSessionId and never updates it
on retry. Each retry is essentially a fresh `start-task.sh --phase plan` call which creates a new
task entry rather than updating the existing one.

## Solution

Two complementary fixes:

### Fix 1: `link-plan.py` — scan ALL recent logs, not just the one matching `planSessionId`

When log scraping fails for `planSessionId`, try ALL `/tmp/opencode-*.log` files modified within
the planning time window. Extract any `Write plans/*.md` lines. If a plan file with matching
project dir is found, use it.

This is a robust fallback: even if planSessionId is wrong, we can find the right log by timestamp.

### Fix 2: `start-task.sh` — detect existing task on retry and update `planSessionId`

When `--phase plan` is called without `--task-id`, check if a recent task exists for the same
`taskFile` path. If yes, update its `planSessionId` to the new session ID instead of creating
a duplicate entry.

This keeps the task record aligned with the actual session that ran.

## Files to modify

- `km-system/scripts/link-plan.py` — add fallback: scan all recent logs in time window
- `km-system/scripts/start-task.sh` — detect duplicate task by taskFile, update planSessionId

## Test

1. Run a planning task that fails on first attempt (simulate by passing invalid task file path).
2. Run again with a valid task — plan should be written.
3. Verify `link-plan.py --all` links the plan to the correct task record.

## Context

Project: `/Users/michal/Projects/openclaw-fork`
Scripts: `/Users/michal/.openclaw/workspace/km-system/scripts/`
State: `/Users/michal/.openclaw/workspace/km-system/state/opencode-tasks.json`
