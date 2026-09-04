---
title: "Share runtime-context registries by identity"
date: 2026-08-25
category: architecture
component: backend
tags: [gateway, plugins, runtime-context, dependency-injection, lifecycle]
---

Slack registered its history context in one `PluginRuntime.channel` registry while Deliberation queried a separately created registry, causing `runtime_context_unavailable` despite successful registration. The fix was to inject the same Gateway-owned channel runtime into plugins. Reuse this rule for process-local registries: consumers and producers must receive the same object instance, not merely equivalent runtime objects.
