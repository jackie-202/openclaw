---
title: "Separate canonical authority from supplemental profiles"
date: 2026-07-25
category: architecture
component: shared
tags: [configuration-authority, channel-model, runtime-profile, precedence]
---

`channels.modelByChannel` became the sole channel-level model authority, while `runtimeByChannel` retained only supplemental fields such as thinking, reasoning, and verbosity. Model resolution must not inspect runtime profiles, but both resolvers can be applied independently so a canonical model and supplemental runtime settings compose cleanly. Reuse this pattern whenever two configuration structures overlap: assign one authoritative owner per field and prevent fallback paths from recreating dual authority.