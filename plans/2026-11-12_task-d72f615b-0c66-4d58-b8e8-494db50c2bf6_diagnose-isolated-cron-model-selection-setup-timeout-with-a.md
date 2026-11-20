---
tdd:
  decision: not_applicable
  reason: This is an investigation with repository-local hermetic characterization tests permitted, but production behavior changes and a RED/GREEN repair cycle are outside scope; evidence must not be manufactured by forcing an artificial failing test.
---

# Plan

## Analysis

- Trace the `model-selection` setup await from `src/cron/isolated-agent/run.ts` through `resolveCronModelSelection`, catalog loading, configuration prerequisites, and the watchdog/cancellation boundary.
- Inspect shared catalog promise creation, reuse, failure/reset semantics, and contrast dynamic loading with the read-only metadata path.
- Separate supplied production observations, source-proven behavior, and unsupported hypotheses; the stage elapsed value is not the total watchdog duration.
- Read `src/agents/AGENTS.md` before work under `src/agents/`; inspect existing model-selection, catalog, and cancellation tests before choosing a test location.

## Approach

- Use existing test seams with deferred promises, fake timers, and stubbed discovery/auth to characterize a blocked prerequisite, setup timeout, and subsequent selection without real provider/model access.
- Preserve coverage for model override precedence, allowlist rejection, and cancellation; determine whether pending work is cancelled and whether failed/pending catalog state affects a later selection.
- Treat a static/configured-only path as a candidate: assess precedence, allowlist, availability, and fallback semantics before recommending it. Recommend a correction only when the reproducer demonstrates a local defect.
- If local evidence cannot attribute the production inner wait, document the single missing operator observation and a bounded diagnostic procedure with exact existing timing mechanism, side effects, and recovery; do not execute live diagnosis.

## Implementation

1. Inspect source owners, callers/callees, adjacent tests, and timing/cancellation contracts; note available focused commands without running unrelated gates.
2. Add the smallest hermetic characterization to an appropriate existing test file. Do not edit production source or introduce generic diagnostic infrastructure.
3. Run the focused test and relevant existing model-selection/catalog/cancellation tests in a prepared runtime; report exact commands/results. Do not fabricate a RED state or modify behavior merely to obtain RED/GREEN evidence.
4. Write `plans/checkpoints/cron-model-selection-setup-timeout.md` with source trace, facts versus hypotheses, reproducer/test paths and outcomes, unsupported runtime claims, remediation-ready/not-ready verdict, and any missing operator observation. Include a concise learning candidate there if useful.
5. Before the final report step, run `python3 scripts/investigation-path.py --task-id task-d72f615b-0c66-4d58-b8e8-494db50c2bf6 --project . --touch` when available. If absent, create `plans/investigations/` and use the prescribed deterministic task-id/title-slug filename. Record prerequisite or runtime blockers precisely; a readback is not approval.

## Testing

- Discover focused test commands from repository instructions/package scripts; execute only authorized hermetic tests when the runtime is prepared.
- Verify the reproducer and relevant existing model-selection, model-catalog, and cancellation assertions; record exact commands and outcomes in the report.
- Do not install dependencies, start services, call providers/models, run live cron, or treat the injected registry command as worker authorization.

## TDD

- Not applicable: this scope diagnoses and characterizes behavior without changing production behavior. Test results are evidence about current behavior, not a required artificial red/green repair cycle. If the evidence identifies a possible correction, document it only as a recommendation with affected tests; production edits require separate authorization.

## Files

- Inspect: `src/cron/isolated-agent/run.ts`, `src/cron/isolated-agent/model-selection.ts`, `src/agents/model-catalog.ts`, `src/agents/models-config.ts`, `src/agents/models-config.plan.ts`, `src/cron/service/agent-watchdog.ts`, execution limit/error definitions, and relevant existing tests.
- Authorized changes: an existing focused test file (or a narrowly scoped new test file if no suitable existing surface exists), `plans/checkpoints/cron-model-selection-setup-timeout.md`, and the final report at the canonical investigation path.
- Do not modify production source, configuration, runtime/catalog/cache state, services, scheduler state, or external/home data.
