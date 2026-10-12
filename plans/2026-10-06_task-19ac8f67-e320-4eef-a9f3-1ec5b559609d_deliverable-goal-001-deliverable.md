# Plan 2026-10-06: Generic host-owner test fixture acceptance repair

Adapt the three retained Discord/Slack owner-path test surfaces to generic exclusive-owner fixtures; preserve real host-handler behavior and record scoped verification evidence.

## Analysis

- The parent plan `plans/2026-10-06_task-9585a131-9645-4da4-8cf4-739de464bf18_deliverable.md` defines the retained assertions, owner boundary, and allowed file scope. The previous attempt changed only one Discord expected owner ID; loader/config/wire coupling remains.
- Targets: `extensions/discord/src/monitor/message-handler.deliberation.test.ts`, the loader-backed process integration in `extensions/discord/src/monitor/message-handler.process.test.ts`, and `extensions/slack/src/monitor/message-handler.deliberation.test.ts`.
- `extensions/AGENTS.md` requires extensions to stay on public SDK seams; the fixtures belong in tests and must not alter production behavior.
- Keep plugin-owned wire/config semantics out of host tests. Generic claim semantics already have coverage in `src/plugins/wired-hooks-inbound-claim.test.ts` and `src/plugin-sdk/channel-inbound.test.ts`.

## Approach

Use a minimal registered generic owner fixture through the existing generic hook test seam. Keep native Discord preflight/process and Slack handler/preparation paths real. Retain host routing, dedupe, event/context, terminal-side-effect, and ordinary-continuation assertions; remove retired plugin discovery/config and plugin wire/status expectations. Add the required checkpoint with exact verification evidence and explicit source-suite-only scope.

## Implementation

1. Inspect the existing three test surfaces and generic hook registration seam; reuse a fixture pattern if one already exists. Do not create a generic helper module or duplicate arbitration logic.
2. In the Discord owner test, replace loader/config setup with a generic owner whose claim result is selectable; retain native event/context and terminal/no-side-effect assertions.
3. In the Discord process test, confine edits to its loader-backed helper/describe; retain real process execution, exactly-one-claim behavior, and terminal side-effect assertions.
4. In the Slack owner test, use generic owner claims while preserving root/child/ambiguous routing, message/app-mention dedupe, terminal no-history/no-reply/no-enqueue behavior, and ordinary handling outside the owner source.
5. Remove only obsolete loader/config/HTTP wire assertions and their now-unused setup. Do not change production, retirement/package policy, or producer-owned contracts.
6. Write `plans/checkpoints/deliberation_generic_host_fixture_cleanup.md` with the characterization-to-final assertion map, exact commands/outcomes, blockers, and explicit source-suite-only scope.

## Testing

- Reuse the genuine parent RED artifact; do not manufacture a new pre-change failure after implementation exists. Capture fresh GREEN for the adapted suites.
- Run the focused Discord owner and process tests with `node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-discord.config.ts <file> --maxWorkers=2`; run Slack owner tests with the corresponding `test/vitest/vitest.extension-slack.config.ts` config.
- Run relevant sibling handler/history/queue and generic inbound-claim tests plus `test/scripts/bundled-plugin-build-entries.test.ts` as scoped regression proof; run serially and record exact results.
- Run the registered `npm test` obligation only if permitted and dependencies are available; report blockers and unrelated failures without weakening the command or claiming broader parity.

## TDD

- Historical RED: link `plans/checkpoints/task-9585a131-9645-4da4-8cf4-739de464bf18.red-green-proof.md` and the parent task checkpoint. Its failing synthetic-owner assertion demonstrates the missing generic-owner behavior.
- Fresh GREEN: adapt that assertion through the generic owner fixture, then capture successful focused runs for all three targets and record outputs in the cleanup checkpoint. Preserve assertion-level mapping for each retained host contract.
- Expected mapping: generic handled/failed claim -> terminal host path and no prohibited effects; native routing/dedupe cases -> owner source arbitration remains intact; non-owner Slack channel -> ordinary preparation continues.

## Files

| Path                                                                          | Planned change                                                                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `extensions/discord/src/monitor/message-handler.deliberation.test.ts`         | Replace retired loader/config/wire assumptions with generic fixture; retain host behavior assertions.         |
| `extensions/discord/src/monitor/message-handler.process.test.ts`              | Replace only the loader-backed process integration setup/assertions.                                          |
| `extensions/slack/src/monitor/message-handler.deliberation.test.ts`           | Replace retired loader/config/wire assumptions; retain routing, dedupe, terminal, and ordinary-path coverage. |
| `extensions/{discord,slack}/src/monitor/<domain-qualified fixture if needed>` | Add only if existing generic seams cannot express the required owner claim outcomes.                          |
| `plans/checkpoints/deliberation_generic_host_fixture_cleanup.md`              | Record command results, assertion mapping, blockers, and source-only scope.                                   |

## Progress

- [x] Read the original plan, scoped extension guidance, and parent checkpoint.
- [ ] Adapt all three retained owner-path test surfaces to a generic owner fixture.
- [ ] Capture fresh GREEN and focused/regression verification.
- [ ] Record required cleanup checkpoint evidence and scope.
