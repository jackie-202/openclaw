# Cron preparation: stage diagnostics and cancellation regression coverage

Project: openclaw-fork. Scope: source and focused local tests only, no live configuration, scheduler, credential, or service changes.

## Evidence

Four manual isolated cron runs on 2026-09-09 hit a 60-second setup watchdog sequentially at 10:10–10:13 Prague. Their unfinished preparations surfaced together at 10:19, lifecycle duration 14–22ms. In src/cron/isolated-agent/run.ts prepareCronRunContext is awaited before lifecycle/executor start. Exact awaited blocker is unknown. OAuth refresh warnings are circumstantial, not a diagnosed cause. Later Luna upstream run succeeded with provider openai in 40s.

## Goal

Make future setup stalls diagnosable and pin cancellation safety without changing model selection, budgets, queueing or delivery behavior.

## Requirements

1. Inspect existing watchdog/setup tests first; characterize timeout, delayed preparation release, and executor non-dispatch before production edits.
2. Add bounded redacted setup-stage timing correlated by job/run identifier at existing preparation boundaries. Reuse existing diagnostics owner; no independent log subsystem. Expose last known stage and elapsed time in setup timeout diagnostic while preserving existing error classification/compatibility.
3. Check cancellation between meaningful awaited preparation stages using existing signal/owner. Do not claim arbitrary non-cancellable awaits can be interrupted; prevent additional stages/model dispatch once cancelled. Preserve cleanup and exactly-one terminal outcome.
4. Test deferred setup exceeding watchdog, release after timeout, exactly one terminal failure, retained stage evidence, no model dispatch after release, and normal successful setup.
5. Preserve separate setup/pre-execution/execution budgets; do not increase timeouts or alter auth/plugin configuration. Never log secrets, prompts or credential details.
6. Keep modules domain-qualified if new files are necessary; avoid generic module basenames.

## Verification

Focused cron watchdog/preparation regression tests plus relevant local typecheck/lint. Final note lists changed boundaries, commands/results and remaining uncertainty. This is observability/cancellation hardening, NOT a claim to fix the unidentified resource wait. No deployment or live runs.
