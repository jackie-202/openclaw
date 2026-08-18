---
title: "Cache asynchronous outbound adapter loading"
date: 2026-08-13
category: runtime-errors
component: backend
tags: [outbound-adapter, async-api, discord, typescript]
---

The initial integration treated `loadAdapter("discord")` as a synchronous adapter, but its public contract returns a promise. Extension typechecking caught attempts to access `sendText` on that promise. The corrected provider caches the adapter-loading promise, awaits it for each delivery, and fails closed when the adapter or `sendText` capability is unavailable. When lazily loading shared runtime adapters, cache the promise rather than only the resolved value so concurrent callers share initialization.