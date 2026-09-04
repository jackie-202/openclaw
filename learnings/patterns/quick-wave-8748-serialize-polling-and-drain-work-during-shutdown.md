---
title: "Serialize polling and drain work during shutdown"
date: 2026-08-24
category: patterns
component: backend
tags: [polling, concurrency, shutdown, timers]
---

A safe polling service performs an immediate tick, schedules an unreferenced interval, and tracks the active tick to prevent overlapping delivery attempts. Shutdown must mark the service stopped, clear the interval, and await the active promise. Reuse this lifecycle pattern for reservation-backed workers so slow polls cannot overlap and process shutdown does not abandon in-flight work.
