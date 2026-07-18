---
title: "Distinguish session runtime history from model-selection overrides"
date: 2026-07-18
category: architecture
component: backend
tags: [openclaw, discord, runtime-profile, model-selection, sessions]
file_type: rules
---

# Distinguish session runtime history from model-selection overrides

For inbound model-selection regressions, `SessionEntry.modelProvider` and `SessionEntry.model` are post-run runtime history. They are persisted from the actual winner by `session-usage.ts` and should not select the next turn.

The fields that can replace a channel runtime profile are `providerOverride` and `modelOverride`, either on the exact session or on a valid parent resolved by `resolveStoredModelOverride`. Their provenance (`modelOverrideSource` plus fallback-origin fields) must be characterized before changing precedence because a user `/model` choice is intentional while an auto-fallback pin can become stale.

Trace and test these seams separately:

1. `resolveChannelRuntimeProfile` output.
2. Initial provider/model passed into directive resolution.
3. `createModelSelectionState` output after stored-override handling.
4. `followupRun.run.provider` and `.model` at execution.
5. Post-run `modelProvider` and `model` persistence.

If ordinary runtime history appears to select a model, locate the hydration writer that converted it into override state. Do not make the channel profile blindly outrank all session overrides, which would break explicit same-session `/model` semantics.
