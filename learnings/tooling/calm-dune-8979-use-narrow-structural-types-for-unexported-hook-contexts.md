---
title: "Use narrow structural types for unexported hook contexts"
date: 2026-08-01
category: tooling
component: shared
tags: [typescript, plugin-sdk, hooks, typecheck]
---

Reusing the stricter inbound-claim context for a `before_dispatch` hook failed because that hook permits optional `channelId`. Importing the exact context type also failed because it was intentionally absent from the public plugin SDK exports. When a public callback type is unavailable, define the smallest local structural context required by the implementation rather than importing private internals or forcing an incompatible exported type. Run extension production and test typechecks because behavior tests alone did not expose this mismatch.
