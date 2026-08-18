---
title: "Serialize polling and drain active work on service stop"
date: 2026-08-13
category: patterns
component: backend
tags: [plugin-lifecycle, polling, concurrency, shutdown]
---

The final-delivery service used one unref'd interval and tracked a single active tick. Repeated timer events returned the active promise instead of starting overlapping KM reservations or provider sends. On stop, it marked the service stopped, cleared the interval, and awaited the active tick. Reuse this lifecycle pattern for polling services to prevent duplicate work and ensure plugin reload or Gateway shutdown does not abandon an in-flight operation.