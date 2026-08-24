---
title: "Register synchronous hooks in every typed dispatch boundary"
date: 2026-08-21
category: patterns
component: shared
tags: [typescript, plugin-hooks, sync-hooks, type-safety]
---

Adding `inbound_event_policy` to the hook map was insufficient. Plugin SDK declaration generation failed until the hook was also included in the explicit synchronous-hook name set. A generic implementation over a union then produced an intersection-parameter error when invoking handlers.

When introducing a synchronous plugin hook, update the hook event map, sync-only name union, registration/dispatch narrowing, metadata, and declaration exports together. Narrow each hook registration to its concrete name before invocation rather than calling a union of function signatures.
