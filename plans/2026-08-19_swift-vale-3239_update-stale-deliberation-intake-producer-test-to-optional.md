# Plan 2026-08-19: Update stale deliberation intake-producer test

Align the producer fixture assertion with the established optional Discord thread contract without changing runtime behavior.

## Analysis

### Codebase Context

- `extensions/deliberation/scripts/intake-producer.test.ts:18` posts a Discord source event with `messageId: "message-override"` and no inbound `threadId`; its outdated object match treats that message id as `sourceThreadId`.
- `extensions/deliberation/src/route-match.ts:113` uses an explicit Discord `threadId` only and omits `sourceThreadId` otherwise; Slack alone falls back to `providerEventId`.
- `extensions/deliberation/src/intake.ts:98` conditionally spreads `sourceThreadId` into the outgoing intake request.
- `extensions/deliberation/src/hooks.test.ts:66` and `extensions/deliberation/src/route-match.test.ts:53` already cover omitted and explicit Discord thread identities.

### Documentation

- `docs/plugins/reference/deliberation.md:83` defines source-target provenance and keeps delivery configuration separate; no documentation update is required.

### Knowledge Base

- `learnings/tooling/quick-wave-2023-run-the-exact-acceptance-command.md`: run the caller-provided command verbatim and retain its result.
- `learnings/tooling/warm-fork-9899-use-concrete-vitest-file-globs-when-directory-targets-hit-the-wrong-project-conf.md`: use an explicit test file for focused local diagnosis; do not substitute it for the requested suite gate.
- Recall used the local fallback (`openclaw-fork-learnings` collection unavailable); its returned architecture notes were either empty metadata or unrelated to this test-only correction.

## Available Skills

- `openclaw-testing`: choose the focused diagnostic invocation if needed and run the required extension suite.
- `save-learning`: record the planning-session learning after this plan is finalized.

## Implementation

1. In `extensions/deliberation/scripts/intake-producer.test.ts`, keep the no-thread Discord event fixture and its configured delivery target unchanged.
2. Replace the stale `sourceThreadId: "message-override"` expectation with `expect(intake).not.toHaveProperty("sourceThreadId")`.
3. Keep assertions that `sourceTarget` is the configured source and that neither legacy `source_thread_id` nor `deliveryTarget` is present.
4. Do not change `extensions/deliberation/src/**` or the producer script implementation.
5. Run `pnpm vitest run extensions/deliberation` and confirm the full extension suite passes.

## Files to Modify

| File                                                      | Change                                                                                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `extensions/deliberation/scripts/intake-producer.test.ts` | Assert absence of `sourceThreadId` for the existing no-thread Discord fixture while retaining source-target and final-target isolation coverage. |

## TDD: skip

This is a stale test-expectation correction, not new behavior: existing admission and hook tests already prove both absent and explicit Discord `sourceThreadId` branches, so no production implementation or RED/GREEN cycle is appropriate.

## Verification

- Optional focused diagnosis: `pnpm vitest run extensions/deliberation/scripts/intake-producer.test.ts`
- Required acceptance: `pnpm vitest run extensions/deliberation`
- Inspect `git diff --name-only` to confirm only `extensions/deliberation/scripts/intake-producer.test.ts` changes during implementation.

## Dependencies

- No API, schema, configuration, dependency, or documentation changes.

---

_Created: 2026-08-19_
_Status: DRAFT_
