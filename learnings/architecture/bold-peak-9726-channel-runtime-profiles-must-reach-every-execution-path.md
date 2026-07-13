---
title: "Channel runtime profiles must reach every execution path"
date: 2026-07-13
category: architecture
component: backend
tags: [runtime-profile, model-selection, auto-reply, precedence]
---

Adding `channels.runtimeByChannel` to the central resolver was insufficient because dispatch and native slash continuation paths still bypassed or gated the new profile. One dispatch helper returned early unless legacy `modelByChannel` existed, and the native slash path omitted `channelRuntimeProfile` when resolving directives.

When introducing a canonical configuration source, audit every execution path and remove guards tied to the legacy source. Add runtime-only regression tests, not merely tests where both old and new configuration fields are present, so accidental dependence on legacy configuration is exposed.
