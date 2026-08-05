# Fix Deliberation plugin runtime entry registration

## Live incident evidence

A fresh post-restart Discord message still does not enter the Deliberation KM spool:

- Configured pilot channel: `1494265174389948538`.
- Fresh Discord event after Gateway restart: `1533940057063559350`, content `tak to jsem zvědav`, timestamp `2026-08-03T20:50:08.832Z`.
- KM audit contains only the older synthetic probe; fresh event is absent and inflight is empty.
- Gateway PID is new and healthy; KM listener health returns HTTP 200.
- Built plugin file `dist/extensions/deliberation/index.js` contains the corrected canonical `sourceTarget: discord:channel:<id>`.
- `openclaw plugins list --json` reports Deliberation `status: loaded` from that exact built file, but `hookCount: 0` and `hookNames: []`.
- The source plugin entry declares four hooks (`inbound_claim`, `before_dispatch`, `before_tool_call`, `message_sending`). A loaded plugin with zero registered hooks cannot ingest or suppress the pilot message.

This supersedes prior hypotheses about the live source target: the corrected payload code is built and loaded, but its registration function is not being activated by the runtime loader.

## Required work

1. Reproduce the built-runtime registration failure with a RED test that loads the actual bundled Deliberation artifact through the same plugin discovery/loader path used by `openclaw plugins list` and Gateway startup.
2. Identify and fix the entry/export contract mismatch so the plugin's `register(api)` function executes.
3. Prove the loaded descriptor reports/contains all four expected hooks and the live/global hook runner has `inbound_claim`.
4. Prove a composed Discord ingress event for the configured source invokes Deliberation intake with canonical `sourceTarget: discord:channel:<channelId>` and terminates ordinary dispatch after durable intake.
5. Preserve fail-closed semantics, processing-source isolation, SecretRef credential handling, and unrelated plugins.
6. Add regression coverage preventing a plugin from appearing `loaded` while silently registering zero expected hooks. Prefer a targeted Deliberation assertion rather than globally requiring every plugin to have hooks.
7. Run focused plugin-loader/source-checkout/Deliberation/Discord ingress tests, build, and the smallest relevant broader verification.

## Acceptance criteria

- `openclaw plugins list --json` against the built checkout reports Deliberation with expected hooks (not `hookCount: 0`).
- A test loading `dist/extensions/deliberation/index.js` via the runtime loader proves registration runs.
- Composed pilot-channel ingress produces a canonical KM intake request and remains terminal/fail-closed.
- Existing Deliberation tests and relevant loader/runtime tests pass.
- Final note specifies exact build and Gateway restart steps needed to activate the fix.

## Scope

Work only in `/Users/michal/Projects/openclaw-fork`. Do not modify OpenClaw config, KM state, Mission Control, or live services. Do not include git operations in the implementation task.
