---
title: "Trace proxy dispatcher ownership before CLI teardown fixes"
date: 2026-10-07
category: architecture
component: backend
tags: [cli, proxy, undici, lifecycle]
---

When investigating a CLI process that hangs after a successful HTTP send, trace the complete cleanup path across the CLI owner, proxy lifecycle, and active dispatcher. In Proxyline 0.3.3, the managed Undici dispatcher owns direct and per-proxy agents and can asynchronously destroy them, but `stopRuntime()` invokes dispatcher destruction without awaiting it. Treat this as a testable candidate cause, not proof: reproduce with a deterministic local request and verify which resource remains active before deciding where cleanup belongs. Never dispose the global dispatcher solely because a short-lived CLI is exiting; inherited and nested proxy owners may share that routing.
