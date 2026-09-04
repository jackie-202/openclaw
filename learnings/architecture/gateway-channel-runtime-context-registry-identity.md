---
title: "Gateway channel runtime registries must share identity"
date: 2026-08-25
category: architecture
component: backend
tags: [gateway, plugins, channel-runtime, slack, deliberation, lifecycle]
file_type: rules
---

# Runtime context registries must be shared by identity

Channel runtime contexts are process-local registrations, not discoverable metadata. A channel monitor can successfully register an account-scoped capability while another plugin still sees it as unavailable if the two components received separately constructed `PluginRuntime.channel` objects.

## Failure pattern

Slack was connected, the configured root was readable through the public action path, and the persisted source-to-thread mapping existed. Deliberation nevertheless returned `SOURCE_HISTORY_UNAVAILABLE`. A closed diagnostic classified the failure as `runtime_context_unavailable`, proving that the provider and persisted identity were not the failing boundaries.

Gateway startup created one channel runtime for channel monitors, while plugin loading independently called `createPluginRuntime()`. Each runtime owned a different `runtimeContexts` map, so Slack registered history into one map and Deliberation queried another.

## Fix pattern

Create or cache the Gateway channel runtime once and inject that exact object into plugin runtime creation. Propagate it through every lifecycle path: setup startup, full/deferred startup, config reload, and plugin reload. Do not add a fallback registry or retry discovery because that creates multiple owners and hides lifecycle bugs.

Tests should prove object identity and behavior: register a context through the monitor-facing runtime, then resolve the same key through the plugin-facing runtime. Live verification should separately establish provider readability, persisted mapping presence, and the final owner route so failures can be assigned to the correct boundary.
