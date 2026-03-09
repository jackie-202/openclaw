# Plan 010: Add Review Phase to Task Lifecycle

Add an optional, explicit code review phase between implementation and completion so tasks can either go through review (`review -> reviewed -> approve`) or intentionally bypass review (`skip-review -> done`) with clear state transitions and UI controls.

_Status: DRAFT_
_Created: 2026-03-09_

## Goals

- Add optional review path to lifecycle: `implementing -> review -> reviewed -> done`.
- Add explicit skip path: `implementing -> done` via `skip-review`.
- Add explicit decision path from reviewed state: `approve -> done`, `reject -> implementing`.
- Persist review metadata in state (`reviewSessionId`, `reviewFile`) and surface it in Mission Control.
- Keep compatibility with current workflow (plan/implement/backlog) while minimizing disruption.

## Problem

Current lifecycle has no structured review checkpoint after implementation. As a result, implementation can transition to done without a dedicated review run, review artifact, or explicit approval/rejection action.

## Analysis

### Current lifecycle behavior

- `start-task.sh` currently supports `plan`, `implement`, and `backlog` only.
- `opencode-monitor.py` recognizes active phases `planning` and `implementing`, and resolves orphaned completion to `planned` or `done`.
- `link-plan.py` links only `planFile` (no review artifact support).
- Mission Control server currently has `POST /api/tasks/plan` only for phase transitions from UI.
- Mission Control frontend currently treats active phases as `planning|planned|implementing` and has no review/reviewed UI/actions.

### State model gaps

- No distinct review-running phase.
- No post-review waiting phase (approval/rejection gate).
- No dedicated review session ID or review report path in task record.
- No endpoints/actions for review lifecycle controls.

## Recommendation: Script Architecture

### Decision

Recommend a two-step approach:

1. **Now (this task): Option A (single script) with internal refactor boundaries**
   - Extend `start-task.sh` with `review`, `skip-review`, `approve`, `reject`.
   - Add small internal helper functions and per-phase Python blocks to reduce branching complexity.
   - Lowest risk and fastest delivery for immediate feature.

2. **Next iteration: Option C (Python core + thin shell wrapper)**
   - Introduce `task_runner.py` with subcommands and shared transition validation.
   - Keep `start-task.sh` as compatibility wrapper invoking Python CLI.

### Why this is best now

- Maintainability: immediate feature lands without large migration blast radius.
- Agent usability: no interface break for existing callers while adding needed phases.
- Testability: monitor/linker logic remains Python; script migration can be incremental and safer later.

## Recommendation: Interface Clarity for Agents

Introduce a **documented target interface** (even if initially mapped by shell):

```bash
python3 task_runner.py plan --task-id <id> <project_dir> <task_file>
python3 task_runner.py implement --task-id <id>
python3 task_runner.py review --task-id <id>
python3 task_runner.py skip-review --task-id <id>
python3 task_runner.py approve --task-id <id>
python3 task_runner.py reject --task-id <id>
```

For this implementation, keep `start-task.sh --phase ...` as the stable external contract, but shape transition logic so migration to subcommands is mostly mechanical.

## Proposed Lifecycle and Transition Rules

### Phases

- `backlog`
- `planning`
- `planned`
- `implementing`
- `review` (active opencode review run)
- `reviewed` (review complete; waiting for decision)
- `done`
- `failed`

### Allowed transitions

- `implementing -> review` (`--phase review`)
- `implementing -> done` (`--phase skip-review`)
- `review -> reviewed` (monitor detects process ended normally)
- `reviewed -> done` (`--phase approve`)
- `reviewed -> implementing` (`--phase reject`)

### Guardrails

- `review` only valid when current phase is `implementing`.
- `skip-review` only valid when current phase is `implementing`.
- `approve`/`reject` only valid when current phase is `reviewed`.
- `review` requires `task.planFile` and `task.projectDir` present.

## Implementation Approach

1. Extend state schema and transition handling in `start-task.sh`.
2. Launch review opencode runs with a dedicated review prompt and `reviewSessionId`.
3. Update monitor phase resolution to understand `review -> reviewed` completion.
4. Extend linker to connect `plans/review/<taskId>.md` into `reviewFile`.
5. Add Mission Control API endpoints for review actions.
6. Add Mission Control UI badges, action buttons, and review report visibility.

## File Changes

### 1) `../.openclaw/workspace/km-system/scripts/start-task.sh`

#### Planned changes

- Extend argument validation to allow phases:
  - `review`, `skip-review`, `approve`, `reject`.
- Add per-phase state updates:
  - `review`: set `phase=review`, `status=running`, set `reviewSessionId`, `reviewStartedAt`.
  - `skip-review`: set `phase=done`, `status=done`, set `finishedAt`, set result note.
  - `approve`: set `phase=done`, `status=done`, set `finishedAt`.
  - `reject`: set `phase=implementing`, `status=running`, clear `finishedAt` if needed.
- Add review prompt prefix (parallel to plan/implement) instructing:
  - load `code-review` skill,
  - use `planFile` + `implSessionId` as context,
  - write report to `plans/review/<taskId>.md`,
  - stop (no implementation).
- Launch opencode only for phases needing sessions (`plan`, `implement`, `review`).
- Update PID writeback to target `reviewSessionId` mapping when phase is `review`.
- Ensure new task records include null defaults for `reviewSessionId`, `reviewFile`, `reviewStartedAt`.

#### Pseudocode / diff sketch

```diff
--- a/.openclaw/workspace/km-system/scripts/start-task.sh
+++ b/.openclaw/workspace/km-system/scripts/start-task.sh
@@
-if [ "$PHASE" != "plan" ] && [ "$PHASE" != "implement" ] && [ "$PHASE" != "backlog" ]; then
+if [ "$PHASE" != "plan" ] && [ "$PHASE" != "implement" ] && [ "$PHASE" != "backlog" ] \
+  && [ "$PHASE" != "review" ] && [ "$PHASE" != "skip-review" ] \
+  && [ "$PHASE" != "approve" ] && [ "$PHASE" != "reject" ]; then
@@
+elif [ "$PHASE" = "review" ]; then
+  # validate task in implementing phase, require planFile/projectDir
+  # set phase=review, status=running, reviewSessionId=session_id, reviewStartedAt=started_at
+elif [ "$PHASE" = "skip-review" ]; then
+  # validate implementing -> mark done directly
+elif [ "$PHASE" = "approve" ]; then
+  # validate reviewed -> done
+elif [ "$PHASE" = "reject" ]; then
+  # validate reviewed -> implementing
@@
-  elif [ "$PHASE" = "implement" ]; then
+  elif [ "$PHASE" = "implement" ]; then
     ...
+  elif [ "$PHASE" = "review" ]; then
+    REVIEW_PREFIX="Your job is to REVIEW completed implementation..."
+    TASK_TEXT="${REVIEW_PREFIX}$(cat \"$TASK_FILE\")"
   fi
@@
-if not target_id and phase == "plan":
+if not target_id and phase in ("plan", "review"):
     # resolve by *SessionId field
```

### 2) `../.openclaw/workspace/km-system/state/opencode-tasks.json`

#### Planned changes

- Evolve schema usage in script-generated records (not manual migration rewrite):
  - add `reviewSessionId` (string|null)
  - add `reviewFile` (string|null)
  - add `reviewStartedAt` (ISO|null)
- Keep backward compatibility for existing records missing these keys.

#### Pseudocode / example task shape

```json
{
  "phase": "review",
  "status": "running",
  "reviewSessionId": "cool-reef-1234",
  "reviewStartedAt": "2026-03-09T22:10:00+00:00",
  "reviewFile": null
}
```

### 3) `../.openclaw/workspace/km-system/scripts/opencode-monitor.py`

#### Planned changes

- Update active phase detection to include `review`.
- Update log-file session lookup:
  - `implementing -> implSessionId`
  - `review -> reviewSessionId`
  - fallback to `planSessionId` for planning.
- Update terminal phase resolution for orphaned done status:
  - `planning + done -> planned`
  - `review + done -> reviewed`
  - `implementing + done -> done`

#### Pseudocode / diff sketch

```diff
--- a/.openclaw/workspace/km-system/scripts/opencode-monitor.py
+++ b/.openclaw/workspace/km-system/scripts/opencode-monitor.py
@@
 def get_log_file_path(task):
     phase = task.get("phase", "")
     if phase == "implementing":
         session_id = task.get("implSessionId")
+    elif phase == "review":
+        session_id = task.get("reviewSessionId")
     else:
         session_id = task.get("planSessionId")
@@
 def resolve_phase(current_phase, terminal_status):
     if terminal_status == "failed":
         return "failed"
     if current_phase == "planning":
         return "planned"
+    if current_phase == "review":
+        return "reviewed"
     if current_phase == "implementing":
         return "done"
@@
-return status == "running" and phase in ("planning", "implementing")
+return status == "running" and phase in ("planning", "implementing", "review")
```

### 4) `../.openclaw/workspace/km-system/scripts/link-plan.py`

#### Planned changes

- Keep existing plan linking behavior.
- Add review artifact linking logic:
  - Detect `plans/review/<taskId>.md` under task `projectDir`.
  - If file exists and `reviewFile` is null, set `reviewFile`.
- Expand candidate selection (`--all`) to include tasks in `reviewed`/`done` with review session metadata.

#### Pseudocode / diff sketch

```diff
--- a/.openclaw/workspace/km-system/scripts/link-plan.py
+++ b/.openclaw/workspace/km-system/scripts/link-plan.py
@@
 def should_link(task):
     needs_plan = ...existing...
+    needs_review = (not task.get("reviewFile")) and bool(task.get("reviewSessionId"))
+    return needs_plan or needs_review
@@
 for task in targets:
     if missing_plan:
         ...existing plan linking...
+    review_path = os.path.join(project_dir, "plans", "review", f"{task_id}.md")
+    if os.path.isfile(review_path) and not task.get("reviewFile"):
+        task["reviewFile"] = review_path
+        state_changed = True
```

### 5) `../mission-control/server.js`

#### Planned changes

- Add four POST endpoints:
  - `/api/tasks/review`
  - `/api/tasks/skip-review`
  - `/api/tasks/approve`
  - `/api/tasks/reject`
- Reuse existing endpoint pattern:
  - read task by id,
  - validate phase preconditions,
  - validate paths when launching opencode-required phases,
  - call `start-task.sh --phase <...> ...`.
- For non-launch phases (`approve`, `reject`, `skip-review`), call script with task context and `--task-id` only if script is updated to derive from state, otherwise pass `projectDir taskFile` consistently.

#### Pseudocode / diff sketch

```diff
--- a/../mission-control/server.js
+++ b/../mission-control/server.js
@@
+if (url.pathname === '/api/tasks/review' && req.method === 'POST') {
+  // require phase implementing
+  // exec start-task.sh --phase review <projectDir> <taskFile> --task-id <id>
+}
+if (url.pathname === '/api/tasks/skip-review' && req.method === 'POST') { ... }
+if (url.pathname === '/api/tasks/approve' && req.method === 'POST') { ... }
+if (url.pathname === '/api/tasks/reject' && req.method === 'POST') { ... }
```

### 6) `../mission-control/public/app.js`

#### Planned changes

- Extend phase vocabulary:
  - include `review`, `reviewed` in valid phases.
- Treat `review` as active; treat `reviewed` as actionable waiting state (active list placement can be retained for visibility).
- Render phase badges:
  - `REVIEW` (amber)
  - `REVIEWED` (teal/blue)
- Add action buttons:
  - implementing cards: `Review`, `Skip Review`
  - reviewed cards: `Approve`, `Reject`
- Add click handlers calling new endpoints.
- Show review report hint/link when `reviewFile` exists on card/detail.

#### Pseudocode / diff sketch

```diff
--- a/../mission-control/public/app.js
+++ b/../mission-control/public/app.js
@@
-const validPhases = ['backlog','defined','planning','planned','implementing','done','failed'];
+const validPhases = ['backlog','defined','planning','planned','implementing','review','reviewed','done','failed'];
@@
-return phase === 'planning' || phase === 'planned' || phase === 'implementing';
+return phase === 'planning' || phase === 'planned' || phase === 'implementing' || phase === 'review' || phase === 'reviewed';
@@
+function renderTaskActions(task) {
+  if (phase === 'implementing') return Review + Skip Review buttons
+  if (phase === 'reviewed') return Approve + Reject buttons
+  return ''
+}
```

### 7) `../mission-control/public/style.css`

#### Planned changes

- Add phase color tokens:
  - `--phase-review` + dim (amber)
  - `--phase-reviewed` + dim (teal/blue)
- Add badge, card, and history styling for both phases.
- Add button styles for new action buttons (review/skip/approve/reject), matching existing aesthetic and small footprint.

#### Pseudocode / diff sketch

```diff
--- a/../mission-control/public/style.css
+++ b/../mission-control/public/style.css
@@
+--phase-review: #ffaa00;
+--phase-review-dim: rgba(255,170,0,0.12);
+--phase-reviewed: #00bcd4;
+--phase-reviewed-dim: rgba(0,188,212,0.12);
@@
+.phase-badge.phase-review { ... }
+.phase-badge.phase-reviewed { ... }
@@
+.task-card.phase-review { ... }
+.task-card.phase-reviewed { ... }
```

## Review Prompt Contract

Review phase prompt should enforce deterministic output and artifacts:

```text
Your job is to perform CODE REVIEW ONLY.

1) Load and apply the code-review skill.
2) Read plan file: <planFile>
3) Use implementation session context: <implSessionId>
4) Produce structured report with sections:
   - What was implemented
   - Missing vs plan
   - Risks/concerns
   - Verdict: APPROVE or REJECT
5) Save report to: plans/review/<taskId>.md
6) Stop. Do NOT implement any code changes.
```

## Test Strategy

### 1) State transition tests (script-level)

- Start from fixture task in `implementing`.
- Run `--phase review`:
  - expect `phase=review`, `status=running`, `reviewSessionId` set.
- Simulate monitor orphan completion:
  - expect `review -> reviewed`.
- Run `--phase approve`:
  - expect `reviewed -> done`.
- Repeat with `--phase reject`:
  - expect `reviewed -> implementing`.
- Run `--phase skip-review` from `implementing`:
  - expect direct `done`.

### 2) Monitor behavior tests

- Validate `is_active_task()` includes review tasks.
- Validate `get_log_file_path()` uses `reviewSessionId` for review phase.
- Validate orphan resolution maps `review + done` to `reviewed`.

### 3) Linker behavior tests

- Place `plans/review/<taskId>.md` in project.
- Run `link-plan.py --all`.
- Verify `reviewFile` gets linked without breaking `planFile` linking.

### 4) Mission Control API tests

- POST each new endpoint with valid/invalid phase states.
- Verify 200 on valid transitions, 409 on invalid phase preconditions.

### 5) Mission Control UI checks

- Confirm badges for `review` and `reviewed` render correctly.
- Confirm implementing task shows Review + Skip Review buttons.
- Confirm reviewed task shows Approve + Reject buttons.
- Confirm review report indicator/link appears when `reviewFile` is populated.

### 6) End-to-end manual flow

1. Create task and complete planning + implementation.
2. Trigger Review from UI.
3. Wait for monitor to move `review -> reviewed`.
4. Open linked review report in detail panel.
5. Approve to done.
6. Repeat second run with Skip Review path.

## Risks and Mitigations

- Invalid transitions from UI/API could corrupt lifecycle.
  - Mitigation: strict phase precondition checks in both server and script.
- Missing `planFile` at review start could produce unusable review prompt.
  - Mitigation: block `review` unless `planFile` is present.
- Monitor may still mark old phases incorrectly if resolution logic incomplete.
  - Mitigation: centralize phase mapping in `resolve_phase()` and add review mapping test coverage.

## Dependencies

- Existing `code-review` skill availability (path should be validated in review prompt instructions).
- No new runtime dependencies required.
- Both repositories must be changed in lockstep (`openclaw-fork` + `mission-control`).

---

_Created: 2026-03-09_
_Status: DRAFT_
