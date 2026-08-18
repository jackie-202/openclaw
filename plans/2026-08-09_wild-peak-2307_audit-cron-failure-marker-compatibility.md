# Plan 2026-08-09: Audit cron failure marker compatibility

Audit the fork marker against pinned upstream source and fixtures, then record one evidence-backed proposal verdict.

## Problem

The fork replaces generic non-zero command errors with one bounded `CRON_FAILURE:` stderr payload, while upstream has since changed output preservation, external redaction, delivery, state, and retry handling. The investigation must determine the marker's end-to-end compatibility without executing code.

## Analysis

### Codebase context

- `src/cron/command-runner.ts` at `dc43c20df50c` recognizes exactly one non-empty marker only for numeric non-zero exits, caps its payload at 512 characters, and changes `CronRunOutcome.error` without removing stderr from `summary` or diagnostics.
- `src/cron/command-output-summary.ts` at `4b85d834ed1586062f31bded2f358fc5192d1674` preserves truncated action-critical lines and selectively redacts them before external delivery; `CRON_FAILURE:` is not part of that contract.
- `src/gateway/server-cron.ts` announces command `summary` independently of `status`/`error`, redacts selected summaries for announce and hooks, and preserves execution errors when delivery also fails.
- `src/cron/service/timer-outcomes.ts`, `src/cron/run-error-reason.ts`, and `src/cron/service/timer-trigger.ts` persist errors/diagnostics, count failures, classify retryability, schedule backoff, disable jobs, and emit finished events.
- Upstream tests cover runner basics, action-line truncation/redaction, command announce/webhook delivery, failed-command completion redaction, persisted delivery state, retry/backoff, and failure destinations. Fork marker tests assert only `error`, marker length, and exclusion of following stderr from `error`.

### Relevant documentation

- `docs/automation/cron-jobs.md` at the pinned base defines stdout/stderr precedence, error conditions, silent output, failure notifications, and retry behavior.
- `src/gateway/AGENTS.md` requires scheduler tests to keep unrelated background loops disabled; this investigation runs no tests.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: trace inventory matches through runtime callers and projections before reaching a verdict.
- `learnings/architecture/2026-08-02_acceptance-repair-plans-must-include-owner-implementation.md`: compare fork changes with pinned upstream ownership and consumers, not the fork symbol alone.
- `learnings/architecture/2026-08-09_channel-model-authority-requires-effective-projection-audits.md`: separate execution, persisted state, and user-visible projection parity.
- Knowledge recall used deterministic local fallback because `openclaw-fork-learnings` was not available.

## Available Skills

- `compound-plan`: persist this investigation plan.
- `recall-knowledge`: apply repository audit rules before synthesis.
- `save-learning`: record planning lessons after finalization.

## Solutions

Use a pinned, read-only evidence ledger rather than running either revision. For each scenario, derive behavior from source and existing fixtures at both commits, trace the resulting outcome through delivery/state/retry consumers, and classify it as compatible, intentional divergence, regression risk, or unproven.

## Implementation

### Pre-investigation checklist

- [ ] Keep all evidence repository-local and pinned to `dc43c20df50c` or `4b85d834ed1586062f31bded2f358fc5192d1674`.
- [ ] Use read-only object inspection (`git show`, `git diff`, `git grep`) without checkout, commit, branch, merge, rebase, or other Git lifecycle operations.
- [ ] Do not modify product code, run tests, execute fixture commands, use live data, or inspect external repositories.
- [ ] Cite file, symbol/fixture, commit, and line or diff hunk for every matrix conclusion.

### Investigation steps

1. **Reproduce statically:** reconstruct runner outcomes from `src/cron/command-runner.ts`, `src/cron/command-output-summary.ts`, `src/process/exec-output.ts`, and their tests at both commits. Populate a matrix with rows for non-zero exit; signal; wall timeout; no-output timeout; stdout-only; stderr-only; empty output; mixed output; one/empty/multiple marker; marker on stdout; zero-exit marker; oversized marker; marker before/inside/after truncated stderr; and marker plus secret. Record exit metadata, selected `error`, `summary`, diagnostic entry, truncation flag, and whether each result is fixture-backed or source-derived.
2. **Trace end to end:** follow every distinct outcome through `src/gateway/server-cron.ts`, `src/gateway/server-cron-notifications.ts`, `src/cron/service/timer-outcomes.ts`, `src/cron/run-error-reason.ts`, `src/cron/retry-hint.ts`, `src/cron/service/timer-trigger.ts`, run-history/task-run persistence, failure alerts, hooks, announce, and webhook paths. Extend the matrix with user-visible text, stored task/job state, delivery state, consecutive-error effects, retry/disable behavior, and each redaction boundary.
3. **Diagnose compatibility:** compare the fork behavior with the pinned upstream docs and fixtures. Inventory covered and missing tests by layer, then identify gaps for mixed streams, all marker cardinalities/locations, signal/timeout interaction, truncation/preservation, diagnostics leakage, failed announce versus completion webhook behavior, error classification/retries, task state, and secrets in `error`, `summary`, logs, hooks, alerts, and webhooks. Mark any conclusion not provable from repository evidence as unknown.
4. **Write report:** before writing, check for `scripts/investigation-path.py`; when present run `python3 scripts/investigation-path.py --task-id wild-peak-2307 --project . --touch` and write only to its returned path. If absent, create `plans/investigations/` if needed and write `plans/investigations/wild-peak-2307_audit-cron-failure-marker-compatibility.md`. Include commit scope, evidence ledger, required failure matrix, fixture/test inventory and gaps, compatibility diagnosis, confidence with limiting evidence, and exactly one final `Proposal verdict:` statement; do not include alternative verdicts or implementation changes.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/investigations/wild-peak-2307_audit-cron-failure-marker-compatibility.md` | Fallback report path when the local helper is absent; otherwise use the helper-returned path under `plans/investigations/`. |

## TDD: skip

This is a source-and-fixture audit with explicit prohibitions on code changes and test runs.

## Dependencies

- Both pinned commits must remain available in the local repository object database.
- Current evidence shows `scripts/investigation-path.py` is absent, so the deterministic fallback applies unless the helper appears before report writing.
- The report may recommend follow-up work, but this task ends after the investigation artifact and does not implement or verify changes.

---
*Created: 2026-08-09*
*Status: DRAFT*
