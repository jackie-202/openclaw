# Final Note: cool-wave-6078

## Delivered behavior

- Configured Slack roots and replies are admitted with `providerEventId = message.ts ?? message.event_ts` and a separate thread identity `thread_ts ?? providerEventId`.
- Deliberation stores child-to-thread correlation in plugin keyed state and leaves the accepted KM intake/history wire unchanged.
- Slack history resolves only the mapped account/channel/thread, returns canonical `v1:slack:<account>:<channel>` provenance, uses exact decimal timestamp ordering, and applies the existing message and 32 KiB bounds.
- Malformed, conflicting, unconfigured, cross-account, cross-channel, off-thread, and non-string route metadata fail closed.

## Stable KM handoff contract

The stable external identity remains three separate facts: `providerEventId` is the actual child Slack timestamp, `sourceTarget` is channel-scoped `v1:slack:<account>:<channel>`, and thread identity is internal OpenClaw correlation state. Do not add `threadId` to the accepted KM intake or history request wire and do not replace a child event ID with `thread_ts`.

## Verification

- `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/source-identity.test.ts extensions/deliberation/src/history-read.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/contract.test.ts extensions/slack/src/monitor/message-handler/prepare.test.ts extensions/slack/src/monitor/deliberation-history.test.ts`: passed 87 Slack tests and 119 Deliberation tests after review fixes.
- `pnpm test extensions/deliberation/src/route-match.test.ts`: passed 27 tests.
- `pnpm tsgo:core`: passed.
- `pnpm tsgo:extensions`: passed.
- `pnpm tsgo:extensions:test`: passed.
- Scoped `pnpm exec oxfmt --check ...`: passed for 18 task files.
- Scoped `pnpm exec oxlint --tsconfig config/tsconfig/oxlint.extensions.json ...`: passed.
- `pnpm build`: passed, including plugin SDK export checks and Control UI build.
- `git diff --check`: passed.
- `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <task scope>`: one accepted non-string metadata finding was fixed; one `channel:` prefix finding was rejected because the plan and host Slack contracts explicitly accept that canonical target envelope.

## Known unrelated failures

- A broader focused run including `extensions/deliberation/src/plugin.test.ts` passed 210 tests but failed two pre-existing final-delivery timer assertions (`loadAdapter` and `completeDelivery` were not called). This task did not modify or debug that unrelated final-delivery behavior.
- `pnpm lint:extensions` is blocked before lint execution by the pre-existing missing `primeChannelOutboundSendMock` export in Slack's boundary declaration build. Scoped oxlint passed.
