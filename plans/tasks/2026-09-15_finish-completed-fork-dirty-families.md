# Finish completed OpenClaw fork dirty families

## Context

Three completed pipeline lineages left two coherent implementation families uncommitted in the OpenClaw fork:

- Deliberation invocation authorization timeout before provider send: `task-190873da-d25c-46f1-87c0-4782fde68765` and its accepted follow-up `task-8a750897-a2ca-4d5d-ba37-7e70d352d86e`.
- Independent recurring cron admission while another scheduled job runs: `task-b06ff88b-f3b3-4ac8-8df5-30fac618b881`.

Current focused verification on 2026-09-15:

- Deliberation: 4 test files, 165 tests passed.
- Cron: 3 test files, 53 tests passed.
- `git diff --check` passed.
- `pnpm exec oxfmt --check ...` found formatting drift in exactly:
  - `extensions/deliberation/src/final-adapter.test.ts`
  - `extensions/deliberation/src/km-client.test.ts`
  - `extensions/deliberation/src/km-client.ts`

This is an independent manually requested completion root. Historical task state and acceptance evidence must remain unchanged.

## Goal

Make the already completed Deliberation and cron dirty families landable without changing their intended behavior, while preserving their exact task, acceptance, checkpoint, and learning evidence.

## Scope

Repository-local only: `/Users/michal/Projects/openclaw-fork`.

1. Inspect the current dirty worktree and the completed task/evidence artifacts for the three task IDs above.
2. Apply the repository formatter only where required to resolve the three currently reported formatting failures. Do not broaden into style cleanup.
3. Review the final diff for semantic regressions and accidental cross-family coupling.
4. Verify both families with focused tests, formatter checks, and the smallest relevant type/lint gate required by scoped `AGENTS.md` guidance.
5. Leave the two implementation families and their evidence ready for the repository's host-owned commit/push workflow.

## Hard exclusions

- Do not edit, include, delete, rename, stage, or otherwise consume `plans/2026-09-15_bold-brook-5925_deliberation-plugin-prepare-portable-package-and-exact.md`; it belongs to paused task `bold-brook-5925`.
- Do not start/unpause/reset or alter `bold-brook-5925` or its batch.
- Do not change behavior beyond what is necessary to resolve a proven blocker found during review/verification.
- Do not deploy, restart Gateway, run real provider calls, replay deliveries, or mutate live cron state.
- Do not rewrite or discard historical acceptance/checkpoint/learning evidence.
- Do not run Git commit/push/branch/staging operations; Jackie owns those after acceptance.
- Do not inspect other repositories or external configuration. Record an unknown/follow-up instead of crossing the repository boundary.

## Expected source families

Deliberation family includes the existing dirty changes under:

- `CHANGELOG.agent.md`
- `docs/plugins/reference/deliberation.md`
- `extensions/deliberation/openclaw.plugin.json`
- `extensions/deliberation/src/config.ts`
- `extensions/deliberation/src/config.test.ts`
- `extensions/deliberation/src/km-client.ts`
- `extensions/deliberation/src/km-client.test.ts`
- `extensions/deliberation/src/final-adapter.test.ts`
- `extensions/deliberation/src/delivery-probe.test.ts`
- task/checkpoint/acceptance/learning artifacts tied to `task-190873da-d25c-46f1-87c0-4782fde68765` and `task-8a750897-a2ca-4d5d-ba37-7e70d352d86e`

Cron family includes the existing dirty changes under:

- `src/cron/service/state.ts`
- `src/cron/service/timer.ts`
- `src/cron/service/timer.test.ts`
- `src/cron/service/timer.regression.test.ts`
- `src/cron/service.rearm-timer-when-running.test.ts`
- task/checkpoint/acceptance/learning artifacts tied to `task-b06ff88b-f3b3-4ac8-8df5-30fac618b881`

Treat any unrelated dirty file as out of scope and leave it untouched.

## Acceptance

- The three formatter failures named above are resolved with formatter-only edits unless review proves a separate correctness issue.
- Focused Deliberation tests pass for `config.test.ts`, `km-client.test.ts`, `delivery-probe.test.ts`, and `final-adapter.test.ts`.
- Focused cron tests pass for `service.rearm-timer-when-running.test.ts`, `timer.regression.test.ts`, and `timer.test.ts`.
- `git diff --check` passes.
- Scoped formatter check passes for every modified implementation/doc/config/test file in the two families.
- Final review reports no unresolved actionable semantic finding. Any finding must name path/line, impact, and evidence.
- The `bold-brook-5925` plan remains byte-identical and untracked; record its before/after SHA-256 in the final note.
- No unrelated dirty paths are modified.
- Final note lists exact commands/results and separates the Deliberation and cron file manifests Jackie should commit.
