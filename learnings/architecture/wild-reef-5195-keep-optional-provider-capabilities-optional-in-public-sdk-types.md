---
title: "Keep optional provider capabilities optional in public SDK types"
date: 2026-08-31
category: architecture
component: shared
tags: [plugin-sdk, compatibility, typescript, optional-capability]
---

Adding `readChannelPage` as a required member of the public `ChannelHistoryRuntimeContext` would have broken existing third-party implementations, even though only the new Slack root-freshness path needs it. Model additive provider capabilities as optional in public SDK interfaces, then check for their presence and fail closed only at call sites whose semantics require them.
