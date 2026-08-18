---
title: Deliberation plugin: optional final delivery target override
type: implementation
---

# Deliberation plugin: optional final delivery target override

Reference: `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260814-091650-c8b343_deliberation-configurable-final-delivery-target.md` (architectural context only; implement only the plugin configuration and adapter slice).

## Goal

Add an optional operator-owned `deliveryTarget` route to `plugins.entries.deliberation.config`.

Behavior:
- absent `deliveryTarget`: final delivery returns to the message's `sourceTarget`, unchanged from today;
- configured `deliveryTarget`: final delivery goes to that Discord account/channel;
- `processingSource` remains unchanged;
- the reviewer, model output, and inbound payload cannot select or override delivery routing.

## Scope

Work only inside `/Users/michal/Projects/openclaw-fork`.

Primary files:
- `extensions/deliberation/openclaw.plugin.json`
- `extensions/deliberation/src/config.ts`
- `extensions/deliberation/src/config.test.ts`
- `extensions/deliberation/src/final-adapter.ts`
- `extensions/deliberation/src/final-adapter.test.ts`
- `extensions/deliberation/src/km-client.ts`
- focused plugin/contract tests where necessary

Do not inspect or modify `km-system`; its contract is owned by the preceding batch task. Use the proposal and the repository-local contract/types as the interface. Do not change `sources`, `processingSource`, restricted-session guards, drafting behavior, or reviewer capabilities. Do not send real Discord messages.

## Required design

- Extend both the plugin manifest schema and runtime Zod schema with an optional route-shaped `deliveryTarget`.
- Preserve strict config validation and canonical Discord account/channel identity checks.
- Ensure the trusted plugin/KM boundary resolves or supplies the configured destination in the form required by the updated KM contract.
- The final adapter must send to the durable effective `deliveryTarget` returned in the delivery envelope; it must not recompute a different target from mutable config after reservation.
- Invocation/completion evidence must use that same durable target.
- Config omission must preserve old same-source behavior.
- Keep routing deterministic and operator-controlled.

## Acceptance

- Existing configuration without `deliveryTarget` parses and sends to source.
- Configuration with a canonical override parses and sends source-A output to target B.
- Invalid routes and unknown config properties fail closed.
- Processing source and source admission behavior are unchanged.
- The fake provider receives exactly the account/channel encoded by the durable delivery target.
- Existing Deliberation plugin unit tests remain green.
- Final note records exact verification commands and results.

## Verification

Run the focused Deliberation config, KM client, final-adapter, plugin, contract, and sole-send tests using the repository's existing test commands, followed by the smallest relevant package typecheck/lint gate.
