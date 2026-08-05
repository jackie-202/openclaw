---
title: "Discord intake hooks need assembled sender identity"
date: 2026-08-02
category: test-failures
component: shared
tags: [discord, plugins, inbound-claim, deliberation, integration-testing]
file_type: rules
---

# Discord hook failures require assembled-context proof

When a channel-scoped `inbound_claim` hook appears absent while a later `before_dispatch` hook still silences the same message, do not infer hook registration failure from the visible behavior alone. Compose the channel process harness with the production dispatcher and a loader-backed registry, then observe the registered handler arguments.

In this case Discord called `inbound_claim`, but `buildDiscordMessageProcessContext` populated the shared sender facts from `sender.id`. Ordinary Discord preflight contexts only guaranteed `author.id`, so the canonical event had `senderId: undefined`; Deliberation intentionally returned `missing-sender-id`, while `before_dispatch` independently matched the source route and silenced it. The correct mapping is `sender.id ?? author.id`: preserve resolved PluralKit member identity when available, otherwise carry the ordinary Discord author.

Discord also imported the broad `openclaw/plugin-sdk/reply-runtime` dynamically at message time. Runtime-late package resolution can select a plugin-local OpenClaw version. Bind the channel module to the narrow host-resolved `reply-dispatch-runtime` facade at load time; that facade keeps the heavy provider dispatcher lazy internally without risking a stale package-level dispatcher.

Useful regression shape:

- Run `processDiscordMessage` with the real host dispatcher and a loader-backed startup registry.
- Assert exact channel, account, conversation, message, sender, timestamp, and content at the real hook.
- Assert successful intake is terminal and sends nothing.
- Reject the intake request and assert the same startup runner reaches `before_dispatch` and still sends nothing.
- Run loader-heavy integration cases last in non-isolated suites, because native resolver and runtime registry state can affect earlier mock-only cases despite normal cleanup.
