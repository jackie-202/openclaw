---
title: "Auto-fallback origins must match the current configured primary"
date: 2026-07-18
category: architecture
component: backend
tags: [openclaw, model-selection, auto-fallback, runtime-profile, discord]
file_type: rules
---

# Auto-fallback origins must match the current configured primary

`SessionEntry.modelProvider` and `SessionEntry.model` are post-run history and do not select the next inbound model. The fields that can replace a channel runtime profile are `providerOverride` and `modelOverride` on the exact session or a valid parent.

An auto-created override is valid only while its `modelOverrideFallbackOriginProvider` and `modelOverrideFallbackOriginModel` still identify the current primary. If a channel profile changes from one primary to another, retaining the old fallback pin silently starts the next turn on the fallback even though the new primary has never failed.

The stale check belongs in the canonical stored-override resolver path and must be consumed twice:

1. During inbound bootstrap before directive resolution, so the run is seeded with the current channel primary.
2. In `createModelSelectionState`, so the stale override is cleared and cannot be reapplied by final selection.

Keep the provenance distinction strict. A same-session override with `modelOverrideSource: "user"` is an explicit `/model` choice and remains authoritative. An auto override whose origin still matches the current primary also remains valid for normal fallback recovery. Only an auto override with a mismatched recorded origin is stale.

Characterization should assert the prepared-run provider/model, not only resolver inputs, and should complete a mocked successful agent run to prove the selected model is persisted without fallback attempts. Also include unprofiled defaults and an unrelated session entry so a broad precedence rewrite cannot pass accidentally.
