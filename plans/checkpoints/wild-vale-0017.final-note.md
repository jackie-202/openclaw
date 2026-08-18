# wild-vale-0017 Final Note

## Root Cause

The Gateway and KM listener were healthy, all sender controls were enabled, and KM still reported one `readyToSend` record, but the running Gateway process had never reserved it. The active process (`PID 5430`, started `2026-08-18 16:04:01 +0200`) predates the freshly emitted runtime that is now proven to register `deliberation-final-delivery`. The earlier loaded-looking plugin evidence was therefore insufficient activation evidence: the canonical sender service was absent from the running lifecycle even though manifest/plugin status and the read-only KM RPC remained healthy.

The current source already contained the canonical sole sender as concurrent batch work, and clean `HEAD` already contained expected-hook enforcement from `28dacc24ebb`. This task did not duplicate either implementation. It added source-checkout and emitted-artifact assertions so a loaded plugin cannot pass these gates without exactly one final-delivery service and all four expected hooks.

## Changed Files

- `scripts/test-built-plugin-singleton.mjs`: requires the built Deliberation record to expose exactly `deliberation-final-delivery`.
- `src/plugins/source-checkout-runtime.test.ts`: requires the source-checkout runtime to register exactly that service in addition to the four typed hooks.
- `plans/checkpoints/wild-vale-0017.checkpoint.md`: restart-resilient task state.
- `plans/checkpoints/wild-vale-0017.red-green-proof.md`: genuine RED/GREEN output.
- `plans/checkpoints/wild-vale-0017.final-note.md`: this evidence ledger.

No Deliberation production, KM, listener, loader, config, SQLite, or provider state was modified. No manual send or second sender was introduced.

## Verification

- `node scripts/run-vitest.mjs src/plugins/source-checkout-runtime.test.ts`: RED, 1 failed and 2 passed because the runtime registered one service while the stale assertion expected zero; GREEN, 3 passed.
- `node scripts/run-vitest.mjs extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/sole-send.test.ts src/plugins/loader.test.ts`: 228 passed across two shards.
- `pnpm build && pnpm test:build:singleton`: passed; emitted plugin singleton reports all four hooks and exactly one final-delivery service.
- `pnpm openclaw plugins inspect deliberation --runtime --json`: loaded and activated from `dist/extensions/deliberation/index.js`; hooks `inbound_claim`, `before_dispatch`, `before_tool_call`, `message_sending`; service `deliberation-final-delivery`; no diagnostics.
- `pnpm openclaw gateway status --deep --require-rpc --json`: active Gateway RPC healthy, version `2026.6.5`, PID `5430`.
- `pnpm openclaw gateway call deliberation.status --json`: controls `source-intake`, `claims`, `review`, and `sender` all true; `readyToSend: 1`; listener healthy.
- `pnpm exec oxfmt --check --threads=1 scripts/test-built-plugin-singleton.mjs src/plugins/source-checkout-runtime.test.ts`: passed.
- `git diff --check`: passed.
- Scoped oxlint commands: blocked before lint by unrelated dirty Slack boundary DTS error, missing `primeChannelOutboundSendMock` export.
- `node scripts/check-changed.mjs -- scripts/test-built-plugin-singleton.mjs src/plugins/source-checkout-runtime.test.ts`: blocked because delegated Blacksmith Testbox CLI is unavailable.
- `.agents/skills/autoreview/scripts/autoreview --mode uncommitted ...`: blocked because unrelated worktree changes expanded the bundle to 2,918,439 characters over the 1,048,576-character engine limit; no review finding was produced.

## Rollout And Live Evidence

Rollout was not performed because the active batch handoff did not expose the required canonical host deploy verifier command or rollout authorization. The required remaining order is: host deploy verifier -> full Gateway restart -> live smoke.

Record `786951effe8b9f7eb035954671b80daafca7e6355dff846d53232761dacc24c7` remains represented by the read-only `readyToSend: 1` count. No `SENT` state, delivery-attempt row, Discord provider message ID, or Discord reply is claimed. Those must be captured read-only after the authorized rollout; they must not be manufactured by manual reservation, send, or SQLite mutation.
