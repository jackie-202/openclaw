---
title: "Separate runtime profiles from legacy model overrides"
date: 2026-07-19
category: architecture
component: shared
tags: [model-selection, runtime-profiles, legacy-compatibility, upstream]
---

Message-time model selection was incorrectly falling back from `channels.runtimeByChannel` to the legacy `channels.modelByChannel` configuration. This allowed stale compatibility configuration to override the intended runtime profile, producing `openai/gpt-5.4` instead of the configured runtime model `openai/gpt-5.5`.

The correction removed `modelByChannel` reads only from the fork-specific runtime selection and dispatch paths while preserving the upstream-owned legacy resolver, schema, migrations, doctor checks, and agent-command behavior.

Reuse this boundary when extending upstream projects: keep new runtime behavior dependent only on its authoritative configuration source, and isolate legacy compatibility in explicitly legacy callers. Do not remove a shared legacy field globally merely because one newer path must stop consuming it.
