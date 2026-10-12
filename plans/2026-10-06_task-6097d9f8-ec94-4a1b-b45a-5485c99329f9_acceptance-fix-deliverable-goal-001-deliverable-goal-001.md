# Plan 2026-10-06: Generic host-owner fixture acceptance repair

Complete the retained Discord/Slack host-path test adaptation, then record scoped proof without changing production behavior.

## Analysis

- The parent plan identifies three retained surfaces: Discord owner-path, Discord process integration, and Slack owner-path tests.
- Current tests still rely on Deliberation loader/config/wire setup. A partial earlier edit changed one expected owner ID but did not register an owner.
- Use only generic public test seams (`createMockPluginRegistry`, `initializeGlobalHookRunner`) with an opaque test owner. Retain native handler/process execution and host routing, dedupe, terminal side-effect, and ordinary-continuation assertions.
- `extensions/AGENTS.md` keeps this test-only; producer wire/config contract assertions remain producer-owned.
- Learning `learnings/architecture/generic-host-tests-avoid-retired-plugin-discovery.md`: register both policy and claim hooks; changing an expected string alone does not establish owner behavior.

## Approach

Replace loader-backed fixtures with directly registered generic exclusive-owner hooks in all three test surfaces. Remove Deliberation-specific config, loader discovery, and HTTP wire assertions from host suites, while retaining assertions that characterize actual host behavior. Record exact command outcomes and assertion mapping in the required cleanup checkpoint; state source-suite-only scope explicitly.

## Implementation

1. Confirm the three existing test surfaces and use the existing public plugin test seam; do not add production changes or a shared helper unless the seam demonstrably cannot express the fixture.
2. Adapt Discord owner-path tests to directly register opaque-owner policy/claim handlers. Keep preflight and process functions real; preserve sender-hint host assertions and terminal/no-ordinary-effect cases.
3. Adapt the Discord process integration fixture to direct generic hook registration. Preserve real process invocation, one claim, event/context assertions, and terminal effects; remove loader/plugin-status and producer HTTP wire assertions.
4. Adapt Slack owner-path tests likewise. Preserve root/child/ambiguous routing, message/app-mention dedupe, terminal no-history/no-reply/no-enqueue behavior, and ordinary handling outside the owner source.
5. Add `plans/checkpoints/deliberation_generic_host_fixture_cleanup.md` with exact commands and outcomes, characterization-to-final assertion mapping, blockers, and explicit source-suite-only scope.
6. Make no production, retirement-policy, package, or producer-contract changes.

## Testing

- Run the focused Discord owner and process tests with `node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-discord.config.ts <test-file> --maxWorkers=2`.
- Run the focused Slack owner test with `node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-slack.config.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts --maxWorkers=2`.
- Run the scoped sibling handler/history/queue, generic inbound-claim, and bundled-plugin-build-entry regressions identified by the parent plan, serially; record exact commands and results in the checkpoint.
- Do not claim broader parity. Report any command blocked or unrelated failure with exact evidence.

## TDD

- Reuse the genuine historical RED at `plans/checkpoints/task-19ac8f67-e320-4eef-a9f3-1ec5b559609d.red-green-proof.md`; do not invent a new pre-change RED after the partial implementation exists.
- Fresh GREEN is required for all three adapted surfaces and their scoped regression runs. Capture through the caller-owned TDD evidence workflow, link the historical RED, and map each retained assertion to its final passing test in the cleanup checkpoint.
- Targeted test files and focused commands are listed in `Testing`; preserve the existing behavior assertions as the GREEN criteria rather than adding tests for retired loader/wire behavior.

## Files

| Path                                                                  | Change                                                                                              |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `extensions/discord/src/monitor/message-handler.deliberation.test.ts` | Replace loader/config/wire fixture with generic registered owner; retain native host assertions.    |
| `extensions/discord/src/monitor/message-handler.process.test.ts`      | Replace only the Deliberation-loader-backed process fixture/assertions with generic hooks.          |
| `extensions/slack/src/monitor/message-handler.deliberation.test.ts`   | Replace loader/config/wire fixture; retain routing, dedupe, terminal, and ordinary-path assertions. |
| `plans/checkpoints/deliberation_generic_host_fixture_cleanup.md`      | Record scoped verification, assertion mapping, blockers, and source-only scope.                     |

## Progress

- [x] Read prior plan, historical RED, extension boundary guidance, and relevant learning.
- [ ] Adapt all three retained test surfaces using the generic public fixture seam.
- [ ] Capture fresh GREEN and scoped regression outcomes.
- [ ] Write the required cleanup checkpoint.
