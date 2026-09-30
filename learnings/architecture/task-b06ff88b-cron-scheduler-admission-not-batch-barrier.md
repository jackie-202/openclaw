---
title: "Cron: oddělit admission od běžících jobů"
date: 2026-09-14
category: architecture
component: backend
tags: [cron, scheduler, concurrency, persistence]
file_type: decisions
---

Keep cron timer admission separate from execution ownership. A tick may reserve only the remaining `maxConcurrentRuns` capacity and return after arming the normal scheduler; each detached run must finalize through the existing locked outcome path before releasing its capacity entry.

Using one tick-wide `running` flag for both admission and execution creates two coupled failures: later-due independent jobs cannot enter available capacity, and fast terminal state remains invisible behind an unrelated slow run. Persist `runningAtMs` only for admitted work so waiting jobs stay due and runnable after capacity is released. The shared active-job marker continues to prevent manual/scheduled collisions.

Characterization needs an unresolved slow agent promise, a command job that becomes due after the first scan, and assertions against persisted terminal state before resolving the slow run. A test that resolves the slow run first cannot demonstrate the liveness fix.
