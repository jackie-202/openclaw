# Acceptance Evidence: fresh-dune-0263

## Built Checkout Plugin Inventory

After `pnpm build` completed successfully, this command ran against an isolated state and absent config:

```bash
OPENCLAW_STATE_DIR="$PWD/.tmp-fresh-dune-0263-state" \
OPENCLAW_CONFIG_PATH="$PWD/.tmp-fresh-dune-0263-openclaw.json" \
pnpm openclaw plugins list --json
```

Exit code: `0`.

The resulting Deliberation record was:

```json
{
  "id": "deliberation",
  "name": "Deliberation",
  "version": "2026.6.5",
  "description": "Fail-closed Discord intake backed by the Deliberation KM.",
  "format": "openclaw",
  "source": "/Users/michal/Projects/openclaw-fork/dist/extensions/deliberation/index.js",
  "rootDir": "/Users/michal/Projects/openclaw-fork/dist/extensions/deliberation",
  "origin": "bundled",
  "enabled": false,
  "status": "disabled",
  "hookNames": ["inbound_claim", "before_dispatch", "before_tool_call", "message_sending"],
  "hookCount": 4
}
```

The source under `dist/extensions` establishes that the command used the built checkout. Disabled status is expected for the isolated empty config; inventory metadata still exposes all declared hooks without importing runtime code.

## Built Runtime Registration

Command:

```bash
pnpm test:build:singleton
```

Exit code: `0`.

```text
[build-smoke] built plugin singleton smoke passed
```

The smoke loads `dist-runtime/extensions/deliberation/index.js`, verifies runtime status `loaded`, verifies all four typed registrations, and verifies the global runner has `inbound_claim`.

## Composed Pilot Ingress

The focused command in `plans/checkpoints/fresh-dune-0263.red-green-proof.md` passed the composed test:

```text
processDiscordMessage Deliberation integration > intakes a configured Discord source through the production dispatch path
```

The composed test asserts all required outcomes in one production dispatch path:

- KM receives `sourceTarget: discord:channel:<channelId>` and the canonical provider event, sender, timestamp, and content fields.
- Successful durable intake resolves `{ handled: true }` and ordinary dispatch, reply delivery, and `before_dispatch` do not run.
- When KM intake rejects, the inbound claim remains terminal and the subsequent `before_dispatch` hook returns `{ blocked: true }`.

## Focused Regression Gate

Command:

```bash
pnpm test src/plugins/manifest-registry.test.ts src/plugins/status.registry-snapshot.test.ts src/plugins/loader.test.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/source-checkout-runtime.test.ts extensions/deliberation/src extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose
```

Exit code: `0`.

```text
Test Files  4 passed (4)
Tests  115 passed (115)
Test Files  1 passed (1)
Tests  105 passed (105)
Test Files  6 passed (6)
Tests  59 passed (59)
[test] passed 4 Vitest shards in 92.89s
```

After the autoreview rollback repair, the same focused command passed again:

```text
Test Files  4 passed (4)
Tests  115 passed (115)
Test Files  1 passed (1)
Tests  105 passed (105)
Test Files  6 passed (6)
Tests  59 passed (59)
[test] passed 4 Vitest shards in 62.29s
```

The loader-specific rollback regression additionally passed all `153` tests. It verifies that a plugin which partially registers the wrong hook is reported as an error with empty `hookNames`, `hookCount: 0`, and no surviving typed registrations.

## Build And Lint

- `pnpm build`: passed after the final production edit.
- `pnpm test:build:singleton`: passed after the final build.
- `pnpm lint:core`: blocked by the unrelated existing Slack boundary error `extensions/slack/src/outbound-payload.test-harness.ts(2,10): Module 'openclaw/plugin-sdk/channel-contract-testing' has no exported member 'primeChannelOutboundSendMock'`.
- `pnpm lint:extensions`: blocked by the same unrelated Slack boundary error before lint execution.
- `pnpm lint:scripts`: its Docker E2E and raw HTTP/2 guards passed, then extension boundary preparation was blocked by the same unrelated Slack error.

## Activation

Activate this rebuilt plugin registry in the managed Gateway with:

```bash
pnpm build
pnpm openclaw gateway restart
pnpm openclaw gateway status --deep
```

Rebuilding without restarting leaves the process-stable plugin registry unchanged; the Gateway restart is required to activate the rebuilt registry.
