---
title: "Normalize legacy configuration only at the parser boundary"
date: 2026-08-21
category: architecture
component: shared
tags: [configuration, normalization, compatibility, single-authority]
---

Canonical `pipelines[]` configuration and legacy fields were accepted as alternative input shapes, but mixed use was rejected. Both shapes normalize once into the same canonical runtime structure, including `pipelineBySourceKey`, so downstream consumers do not maintain dual code paths. Reuse this pattern for migrations: keep compatibility at the parser boundary, establish one runtime authority, reject ambiguous mixed configurations, and define a bounded removal gate for the legacy input.
