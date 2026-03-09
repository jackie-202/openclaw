# Plan 009: Fix Plan Linking When Planning Task Is Retried

Ensure plan auto-linking works when a planning task is retried and the successful plan is produced under a newer session ID than the original `planSessionId` stored in task state.

_Status: DRAFT_
_Created: 2026-03-09_

## Goals

- Make `link-plan.py` robust to stale `planSessionId` values caused by retries.
- Keep task state aligned with the latest planning attempt by updating `planSessionId` on plan retries.
- Avoid duplicate planning task entries for the same canonical `taskFile` when retrying.
- Preserve existing behavior for normal (single-attempt) planning runs.

## Problem

When `start-task.sh --phase plan` is launched multiple times for the same task (for example, after an earlier failed attempt), each run gets a new session ID and writes logs to `/tmp/opencode-<session>.log`. The current state handling keeps the original `planSessionId`, so `link-plan.py` inspects the wrong log and can return `no_match` even when a later attempt successfully wrote `plans/<NNN>_<slug>.md`.

## Analysis

### Context from codebase

- `km-system/scripts/link-plan.py`
  - Primary linking path is `try_log_scraping(task, project_dir)` using `/tmp/opencode-<planSessionId>.log` only.
  - Fallback is `try_timestamp_scan(task, project_dir)`, which scans `plans/*.md` mtimes.
  - Current behavior does not inspect alternate opencode logs when `planSessionId` is stale.

- `km-system/scripts/start-task.sh`
  - In plan phase, when no `--task-id` is passed, script always appends a brand-new task record with `id=session_id` and `planSessionId=session_id`.
  - No dedupe/merge logic exists for retries of the same canonical `taskFile`.
  - Retry launched as another plan run can drift state away from the eventually successful session.

### Root cause

State identity for planning retries is tied to first-created task record/session instead of the latest active plan attempt for the same task file.

## Approach

Implement two complementary fixes:

1. **Resilient log fallback in `link-plan.py`**
   - Keep existing primary behavior (use `planSessionId` log first).
   - If primary fails, scan all relevant `/tmp/opencode-*.log` files within the planning time window and extract `Write plans/*.md` candidates.
   - Select only plans that resolve under the task's `projectDir` and exist on disk.
   - Use deterministic selection rules and avoid guessing on ambiguity.

2. **Retry-aware state update in `start-task.sh` plan phase**
   - When plan phase is called without `--task-id`, detect an existing recent task for the same canonical `taskFile`.
   - Update that existing task record instead of creating a duplicate:
     - set `phase=planning`, `status=running`
     - set `planSessionId=<new session id>`
     - refresh `planningStartedAt`
     - reset plan completion/result fields relevant to a new plan attempt
   - Reuse existing task `id` as logical task identity.

## File Changes

### 1) `km-system/scripts/link-plan.py`

#### Planned changes

- Add helper to enumerate candidate opencode logs in `/tmp` filtered by mtime window derived from `planningStartedAt` and `finishedAt` (with tolerance).
- Add helper to parse each log for `Write plans/<NNN>_*.md` matches (existing regex reused).
- Add fallback method (after `try_log_scraping`, before/alongside timestamp scan) that:
  - iterates recent logs,
  - extracts plan write matches,
  - resolves path against `projectDir`,
  - retains existing files only,
  - deduplicates candidates,
  - returns one deterministic candidate or `None` on ambiguity.
- Extend `link_task()` method tagging (for observability), e.g. `recent_log_scan`.

#### Pseudocode / diff sketch

```diff
--- a/km-system/scripts/link-plan.py
+++ b/km-system/scripts/link-plan.py
@@
 def link_task(task):
     project_dir = derive_project_dir(task)
@@
     plan_path = try_log_scraping(task, project_dir)
     if plan_path:
         return plan_path, "log_scraping"

+    plan_path = try_recent_logs_scan(task, project_dir)
+    if plan_path:
+        return plan_path, "recent_log_scan"
+
     plan_path = try_timestamp_scan(task, project_dir)
     if plan_path:
         return plan_path, "timestamp_scan"

     return None, "no_match"
```

```python
def try_recent_logs_scan(task, project_dir):
    started = parse_iso(task.get("planningStartedAt"))
    finished = parse_iso(task.get("finishedAt"))
    if not started or not finished:
        return None

    window_start = started - timedelta(minutes=2)
    window_end = finished + timedelta(minutes=2)

    candidates = []
    for log_path in glob.glob("/tmp/opencode-*.log"):
        if not log_mtime_in_window(log_path, window_start, window_end):
            continue
        for rel in extract_plan_writes(log_path):
            abs_path = os.path.join(project_dir, rel)
            if os.path.isfile(abs_path):
                candidates.append(abs_path)

    unique = stable_unique(candidates)
    if len(unique) == 1:
        return unique[0]
    return None
```

#### Notes

- Keep existing behavior first so known-good records remain fast and deterministic.
- Only use logs in planning time window to reduce cross-task contamination.
- If multiple candidates survive, fail safe (`no_match`) rather than linking incorrectly.

### 2) `km-system/scripts/start-task.sh`

#### Planned changes

- Update plan-phase Python block logic for no `--task-id` path:
  - Search existing `data["tasks"]` for same canonical `taskFile`.
  - Prefer the most recent matching task (by `planningStartedAt` / `definedAt`) in active/retriable phases.
  - If found: update existing record for retry (do not append new task).
  - If not found: retain current behavior and append new task record.
- Ensure output includes whether task was created vs retried-updated.

#### Pseudocode / diff sketch

```diff
--- a/km-system/scripts/start-task.sh
+++ b/km-system/scripts/start-task.sh
@@
 else:
-    task_id = session_id
-    data["tasks"].append({ ... "id": task_id, "planSessionId": session_id, ... })
+    retry_task = find_task_by_taskfile(data["tasks"], task_file_path)
+    if retry_task:
+        task_id = retry_task["id"]
+        retry_task["phase"] = "planning"
+        retry_task["status"] = "running"
+        retry_task["planSessionId"] = session_id
+        retry_task["planningStartedAt"] = started_at
+        retry_task["plannedAt"] = None
+        retry_task["finishedAt"] = None
+        retry_task["pid"] = None
+        retry_task["planFile"] = None
+        retry_task["result"] = None
+        retry_task["errorMessage"] = None
+    else:
+        task_id = session_id
+        data["tasks"].append({ ... "id": task_id, "planSessionId": session_id, ... })
```

```python
def find_task_by_taskfile(tasks, task_file_path):
    matches = [t for t in tasks if t.get("taskFile") == task_file_path]
    if not matches:
        return None
    # choose most recently touched record
    matches.sort(key=lambda t: t.get("planningStartedAt") or t.get("definedAt") or "")
    return matches[-1]
```

#### Notes

- This keeps a stable logical task record across retries and ensures `planSessionId` tracks the session that actually ran.
- PID write-back already supports non-session task IDs via `PID_TARGET_ID`; preserve that behavior.

## Test Strategy

### Scenario A: Retry after failed first attempt

1. Start plan phase with an invalid setup to force failure before plan write.
2. Start plan phase again for same task file with valid setup.
3. Verify in `opencode-tasks.json` that:
   - same task `id` is reused,
   - `planSessionId` equals latest session,
   - no duplicate task record created for same canonical `taskFile`.
4. Run `link-plan.py --all` and verify task gets correct `planFile`.

### Scenario B: Fallback works with stale `planSessionId`

1. Create a controlled state where `planSessionId` points to a failed log.
2. Ensure successful run exists in another recent `/tmp/opencode-*.log` within window.
3. Run `link-plan.py <task_id>` and verify `method=recent_log_scan` and correct `planFile` is linked.

### Scenario C: Ambiguity safety

1. Ensure two candidate logs in same time window both reference different existing `plans/*.md`.
2. Run linker and verify it returns `no_match` (no incorrect linkage).

### Scenario D: Non-retry regression

1. Run a normal single-attempt planning task.
2. Verify task is created as before and linker still succeeds via `log_scraping`.

## Risks and Guardrails

- Risk: broad log scan could pick unrelated plans.
  - Guardrail: constrain by planning window and project path; fail closed on multi-match.
- Risk: retry detection could merge unrelated tasks sharing a task file path pattern.
  - Guardrail: match exact canonical `taskFile` string only.
- Risk: stale fields from prior failed run leak into retry lifecycle.
  - Guardrail: explicitly reset `plannedAt`, `finishedAt`, `planFile`, `result`, `errorMessage`, `pid` on retry update.

## Dependencies

- No new external dependencies.
- Uses existing Python stdlib (`glob`, `os`, `datetime`, `json`, `re`).
- Operates on existing state file and `/tmp/opencode-*.log` convention.

---

_Created: 2026-03-09_
_Status: DRAFT_
