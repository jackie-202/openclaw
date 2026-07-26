---
title: "Transitional authority changes must remove presence guards"
date: 2026-07-24
category: architecture
component: backend
tags: [openclaw, channels, model-selection, migration, fallback]
file_type: rules
---

# Transitional authority changes must remove presence guards

When one configuration source becomes canonical but a deployed source remains as a temporary fallback, putting the fallback only inside the canonical resolver is not sufficient. Every caller-side guard that checks whether the canonical config map exists must also be removed; otherwise fallback-only deployments never invoke the resolver.

For channel model authority, keep the transition bounded as follows:

1. Preserve `resolveChannelModelOverride()` as the model-facing API.
2. Resolve `channels.modelByChannel` first.
3. On a miss, call one proposal-marked helper that reads `runtimeByChannel[*][*].model`, warns once for that invocation, and maps the match into the canonical result shape.
4. Make all model consumers call that API without checking `cfg.channels?.modelByChannel` first.
5. Continue resolving the runtime profile separately only where thinking, reasoning, or text verbosity is consumed.

This keeps provider and target matching centralized, preserves current non-model behavior, and lets the cleanup slice remove the fallback helper and its single call without revisiting every execution path.
