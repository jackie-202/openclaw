---
title: "Oddělení routing identity od KM sourceTarget"
date: 2026-08-03
category: architecture
component: backend
tags: [openclaw, deliberation, discord, canonicalization, intake]
file_type: decisions
---

# Separate routing identity from Deliberation grouping identity

Discord Deliberation intake carries two identities with different owners:

- The plugin route key is `discord + accountId + bare channelId`. It selects configured sources and excludes the processing route, so account identity must remain there.
- The KM `sourceTarget` is `discord:channel:<channelId>`. It groups debounce work by canonical provider channel and must not include the OpenClaw account alias.

Reusing the route key shape for the wire field silently produces values such as `default:<channelId>`. Synthetic unit fixtures can miss this because route matching still succeeds. The strongest regression is the existing loader-backed Discord process test that captures the JSON sent to `/deliberation/v1/intake`; pair it with a direct table covering default/non-default accounts and runtime targets with/without `channel:`.

Keep `providerEventId` equal to the Discord message ID. A successful KM intake remains a terminal `inbound_claim`, while errors remain non-claiming and depend on the separate `before_dispatch` fail-closed guard.
