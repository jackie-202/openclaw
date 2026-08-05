---
title: "Separate routing identity from canonical event identity"
date: 2026-08-03
category: architecture
component: backend
tags: [discord, deliberation, canonicalization, routing, intake]
---

Discord Deliberation intake incorrectly emitted `sourceTarget` as `<accountId>:<channelId>`, coupling an OpenClaw account alias to the downstream event identity. The canonical value is provider-qualified and account-independent: `discord:channel:<channelId>`. Keep account identity only in route matching, preserve the Discord message ID as `providerEventId`, and normalize runtime target prefixes before constructing the payload. Reuse boundary tests that cover default and non-default accounts plus prefixed and unprefixed targets; explicitly reject the legacy account-qualified representation.
