# Diagnose isolated cron model-selection setup timeout with a hermetic reproducer

## Outcome

Locate the exact source-level wait/caching/cancellation failure relevant to repeated cron setup watchdogs, and deliver a small reproducible test plus a concrete scoped remediation recommendation. This is an investigation, not permission to change production behavior. Do not claim the production root cause is established from a plausible source path alone.

## Observed evidence supplied by host

On 2026-11-12 performance-scaling-review job39ceca2f-91d3-4681-bf3b-1f0ab869c73d failed four times before runner start. Explicit model openai/gpt-6.1-sol; thinking off; job timeout1200seconds. Last manual run manual:39ceca2f-91d3-4681-bf3b-1f0ab869c73d:1794477919537:10 began1794477919557, ended after60029ms. Error: `cron: isolated agent setup timed out before runner start (last setup stage: model-selection, elapsed: 1987ms)`. Earlier last-stage elapsed861/46/219ms with total~60000ms. Do not interpret stage elapsed as the total duration. No reviewer prepare/publication or runner/model request started for these failures. Host models list reports the explicit model configured/available, but its read-only catalog path does not validate the dynamic load used by cron. No relevant model-catalog per-stage debug logs were present in inspected production logs. Production timing instrumentation was not enabled; exact inner await remains unknown.

## Starting evidence / source scope

Repository /Users/michal/Projects/openclaw-fork only.

- src/cron/isolated-agent/run.ts: runSetupStage("model-selection") awaits resolveCronModelSelection.
- src/cron/isolated-agent/model-selection.ts: payload override currently awaits loadModelCatalog({config}) before resolving the explicit ref; inspect precedence/allowlist and tests.
- src/agents/model-catalog.ts: default (non-readOnly) shared promise; ensureOpenClawModelsJson, lazy imports, discovery, plugin augmentation. readOnly=true has separate persisted/static path. A pending shared promise can be reused; need prove behavior rather than assume root cause.
- src/agents/models-config.ts and models-config.plan.ts: follow precise awaited prerequisites as needed.
- src/cron/service/agent-watchdog.ts and execution limits/errors: 60s setup budget distinct from configured run budget; inspect cancellation wiring and existing tests.
  Existing relevant model-selection, model-catalog, preparation-cancellation tests should be reused rather than create a new diagnostic framework.

## Work

1. Trace exact await ownership, setup cancellation, shared cache failure/reset behavior, and static configured model resolution. Explain any difference between metadata list success and cron setup readiness.
2. Use deterministic fake timers/deferred promises/stub discovery, not real provider access, to reproduce the stuck prerequisite + timeout + a subsequent selection. Determine whether the watchdog cancels pending work and whether a timed-out catalog poisons subsequent runs. Keep normal allowlist rejection and precedence covered.
3. Identify a demonstrated local defect if any; give smallest safe correction and affected tests. A static read-only/configured-only fast path is only a candidate, not preapproved behavior: assess exact compatibility, availability and fallback semantics. Do not increase watchdogs or remove providers as a speculative fix.
4. Record a bounded operator diagnostic plan if actual live inner-wait attribution still requires it, including exact existing timing mechanism, side effects and recovery; do not execute live diagnosis yourself.
5. Deliver plans/checkpoints/cron-model-selection-setup-timeout.md with facts vs hypotheses, exact commands/results, test file locations, unproven runtime claims and a clear remediation-ready/not-ready verdict.

## Safety

No production source changes in this investigation; repository-local hermetic test additions and investigation markdown are allowed. No external repository/home configuration/credential/auth DB/session/task-store inspection. No networking/provider/model calls or local model/service startup; mock discovery and auth. No live cron execution, scheduler/task lifecycle mutation, configuration changes, deployment/build activation, process signals or restarts. Never edit actual catalog/runtime/cache/report state. No new generic helper modules, daemon, retry loop, diagnostic service or broad refactor. No source speculation presented as an observed runtime cause.

## Acceptance

A focused executable hermetic reproducer and commands/results; full source ownership trace of the exact awaited path; explicit supported/unsupported hypotheses; minimal fix recommendation only when demonstrated. If no defect proven, say so and name the single missing operator observation rather than manufacture one. Preserve all existing rejection/precedence/cancellation assertions.

## Previous Plan (rejected - attempt 1)

Plan file: /Users/michal/Projects/openclaw-fork/plans/2026-11-12_task-d72f615b-0c66-4d58-b8e8-494db50c2bf6_diagnose-isolated-cron-model-selection-setup-timeout-with-a.md
Review feedback: The plan largely matches the investigation, but its mandatory RED/GREEN procedure permits artificial proof and conflicts with the prohibition on production changes.
Read the previous plan, understand what was wrong, and produce a corrected plan.
