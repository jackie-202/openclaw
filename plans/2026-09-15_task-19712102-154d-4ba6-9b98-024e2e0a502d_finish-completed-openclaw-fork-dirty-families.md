# Plan 2026-09-15: Finish completed OpenClaw fork dirty families

Format the three reported Deliberation files, revalidate the completed Deliberation and cron changes, and hand off separate commit manifests without changing behavior or historical evidence.

## Analysis

### Codebase Context

- Deliberation config gives only `invoke` its 30-second default authorization budget; `km-client.ts` caps it by the reservation lease and `final-adapter.test.ts` proves a late server authorization still causes zero provider sends and completions.
- Cron admission tracks active scheduled job IDs separately from the short-lived timer lock; each detached run reloads, applies the existing terminal-outcome owner, persists, releases capacity, and rearms.
- Existing focused tests already cover the modified behavior: `extensions/deliberation/src/{config,km-client,delivery-probe,final-adapter}.test.ts` and `src/cron/service{.rearm-timer-when-running,.timer.regression,.timer}.test.ts`.

### Documentation

- `extensions/AGENTS.md` requires plugin-local ownership and manifest/config accuracy.
- `docs/AGENTS.md` requires root-relative Mintlify links and generic documentation.
- `docs/plugins/reference/deliberation.md` documents the distinct pre-send authorization timeout and fail-closed outcome.

### Knowledge Base

- `learnings/architecture/task-190873da-invocation-authorization-timeout.md`: authorization is pre-send evidence; cap its wait by the lease and never retry/send after absent or timed-out evidence.
- `learnings/test-failures/preserve-late-server-effects-in-authorization-timeout-tests.md`: preserve the independent late server record while asserting zero provider/completion calls.
- `learnings/architecture/task-b06ff88b-cron-scheduler-admission-not-batch-barrier.md`: admit only remaining capacity, retain `runningAtMs` for admitted work, and finalize through the existing owner path.
- Recall used the local backend because the `openclaw-fork-learnings` collection was absent; its additional results contained no more actionable completion constraint.

## Implementation

1. Record `shasum -a 256 plans/2026-09-15_bold-brook-5925_deliberation-plugin-prepare-portable-package-and-exact.md` and the initial dirty-path manifest. Do not read, edit, stage, or otherwise consume that paused plan.
2. Read the three historical plans, checkpoints, acceptance runs, and task-specific learnings only to confirm the completed behavior and prior proof; leave every historical task, checkpoint, acceptance, and learning artifact byte-identical.
3. Run `pnpm exec oxfmt --write extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/km-client.ts`. Inspect the resulting diff and reject any edit outside formatter output.
4. Review the final Deliberation diff as one decision surface: config schema, manifest schema, client lease-bound timeout, adapter send ordering, delayed and expired-lease tests, docs, and changelog. Confirm ordinary KM calls retain `requestTimeoutMs`, no invoke timeout sends/retries, and manifest/runtime bounds agree.
5. Review the final cron diff as one decision surface: timer admission, `scheduledJobIds` lifecycle, persistent `runningAtMs`, active-job collision protection, `applyOutcomeToStoredJob`, reload/persist/rearm order, and regression tests. Confirm a slow job cannot consume spare capacity or delay an unrelated job's terminal state.
6. Run the focused suites serially:
   - `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/final-adapter.test.ts`
   - `pnpm test src/cron/service.rearm-timer-when-running.test.ts src/cron/service/timer.regression.test.ts src/cron/service/timer.test.ts`
7. Run `pnpm check:test-types` as the combined core/extension test-type gate, then `pnpm lint:core` and `pnpm lint:extensions` as the narrow owner-path lint gates. If a gate fails, distinguish a failure in these families from an unrelated existing failure; make a source change only for a proven family regression.
8. Run `git diff --check` and `pnpm exec oxfmt --check` over all 14 implementation/doc/config/test files in the two manifests. Re-run the paused-plan SHA-256 and compare it to step 1; verify no unrelated dirty path changed.
9. Provide a final handoff note with exact commands/results, formatter-only paths, semantic-review outcome (or path/line/impact/evidence for a blocker), before/after paused-plan SHA-256, and separate Deliberation and cron file manifests. Do not commit, stage, push, deploy, restart, make provider calls, or mutate cron state.

## Files to Modify

| File                                                | Change                 |
| --------------------------------------------------- | ---------------------- |
| `extensions/deliberation/src/final-adapter.test.ts` | Formatter output only. |
| `extensions/deliberation/src/km-client.test.ts`     | Formatter output only. |
| `extensions/deliberation/src/km-client.ts`          | Formatter output only. |

## Commit Manifests

**Deliberation**

- `CHANGELOG.agent.md`
- `docs/plugins/reference/deliberation.md`
- `extensions/deliberation/openclaw.plugin.json`
- `extensions/deliberation/src/config.ts`
- `extensions/deliberation/src/config.test.ts`
- `extensions/deliberation/src/km-client.ts`
- `extensions/deliberation/src/km-client.test.ts`
- `extensions/deliberation/src/final-adapter.test.ts`
- `extensions/deliberation/src/delivery-probe.test.ts`
- Historical artifacts only: task/checkpoint/acceptance/learning paths for `task-190873da-d25c-46f1-87c0-4782fde68765` and `task-8a750897-a2ca-4d5d-ba37-7e70d352d86e`.

**Cron**

- `src/cron/service/state.ts`
- `src/cron/service/timer.ts`
- `src/cron/service/timer.test.ts`
- `src/cron/service/timer.regression.test.ts`
- `src/cron/service.rearm-timer-when-running.test.ts`
- Historical artifacts only: task/checkpoint/acceptance/learning paths for `task-b06ff88b-f3b3-4ac8-8df5-30fac618b881`.

## TDD: skip

This is a formatter-and-verification completion pass over behavior already protected by accepted RED/GREEN evidence and existing focused tests; do not fabricate a new RED cycle or edit tests except formatter output.

## Dependencies

- Healthy local `pnpm` install with `oxfmt`, Vitest, `tsgo`, and OXLint available.
- Historical evidence is read-only. The only allowed new artifact is this task's dedicated plan; the `bold-brook-5925` plan must remain untracked and byte-identical.

---

_Status: DRAFT_
