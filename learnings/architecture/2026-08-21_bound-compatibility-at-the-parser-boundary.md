---
title: "Ohraničte kompatibilitu na hranici parseru"
date: 2026-08-21
category: architecture
component: shared
tags: [configuration, normalization, compatibility, deliberation, pipelines]
file_type: rules
---

# Bound compatibility at the parser boundary

When a configuration shape changes from global `sources` plus one `deliveryTarget` to per-source pipelines, accepting both raw forms throughout runtime creates two authorities. Parse exactly one closed raw branch at startup, reject any mixed presence before branch parsing, and normalize legacy input immediately into the canonical pipeline array.

Derived compatibility values should be projections of canonical state, not retained legacy fields. For Deliberation, the temporary producer target exists only when every normalized pipeline has the same explicit target. Runtime source consumers use the canonical source-keyed pipeline index, so no caller can accidentally continue reading legacy `sources`.

The removal gate must name observable conditions owned by the transition: live config migrated to the canonical shape, operational fixtures free of legacy plugin-config examples, and the downstream producer slice consuming selected pipelines directly. This keeps compatibility bounded and prevents a temporary projection from becoming permanent architecture.

Keep canonical config targets separate from existing KM/final-delivery target types when their field names or provider constraints differ. Reusing the old target schema would either leak legacy names into the new authority or accidentally change producer and wire behavior outside the configuration slice.
