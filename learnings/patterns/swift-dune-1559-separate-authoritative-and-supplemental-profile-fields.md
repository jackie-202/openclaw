---
title: "Separate authoritative and supplemental profile fields"
date: 2026-07-24
category: patterns
component: backend
tags: [precedence, runtime-profile, model-selection, configuration]
---

A runtime profile can still provide supplemental settings such as thinking and reasoning levels even when its model is no longer authoritative. Consumers therefore resolve the model through `resolveChannelModelOverride` while independently reading supplemental fields through `resolveChannelRuntimeProfile`. Avoid selecting the entire profile from one source when individual fields have different authority rules. Test mixed-source cases explicitly, such as a `modelByChannel` model combined with runtime thinking and reasoning values.