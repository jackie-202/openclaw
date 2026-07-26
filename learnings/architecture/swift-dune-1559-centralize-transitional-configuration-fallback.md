---
title: "Centralize transitional configuration fallback"
date: 2026-07-24
category: architecture
component: shared
tags: [configuration, resolver, migration, deprecation]
---

When moving channel model authority from `runtimeByChannel.model` to `modelByChannel`, every consumer was routed through `resolveChannelModelOverride`. The resolver first checks the authoritative configuration and only then uses the deprecated runtime model, emitting migration metadata when fallback occurs. Reuse this pattern for staged configuration migrations: encode precedence and temporary compatibility in one resolver rather than duplicating fallback logic across callers. Give the fallback an explicit removal milestone so it does not become permanent.