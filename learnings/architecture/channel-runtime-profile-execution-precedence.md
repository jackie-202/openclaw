---
title: "Profily runtime kanálu patří do cesty spuštění"
date: 2026-07-13
category: architecture
component: backend
tags: [openclaw, channels, runtime-profile, model-selection, auto-reply]
file_type: decisions
---

# Channel runtime profiles must be resolved at the execution boundary

`channels.runtimeByChannel` is not only display metadata. Inbound execution must resolve one effective profile and carry it through model selection, directive defaults, and provider request parameters.

The effective precedence is:

1. Live session state
2. Persistent channel runtime profile
3. Legacy `modelByChannel`
4. Agent/global defaults

Keep target matching in `src/channels/model-overrides.ts`. The effective runtime resolver should merge only the legacy model fallback into the matched profile; callers should not repeat channel, parent, thread, or wildcard matching.

Runtime fields have different downstream owners:

- `model` seeds model selection before stored session overrides are applied.
- `thinkingLevel` and `reasoningLevel` are defaults in directive resolution, below explicit session/directive state.
- `textVerbosity` is a provider request parameter and must travel as a request-scoped stream parameter into the embedded runtime. It is not the same as OpenClaw's tool-progress `verboseLevel`.

Check both normal inbound turns and native slash fast paths. Also remove legacy-presence guards from consumers: a `runtimeByChannel`-only configuration must work without any `modelByChannel` entry.
