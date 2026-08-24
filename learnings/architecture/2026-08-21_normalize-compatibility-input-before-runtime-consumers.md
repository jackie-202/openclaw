---
title: "Normalize compatibility input before runtime consumers"
date: 2026-08-21
category: architecture
component: shared
tags: [configuration, normalization, compatibility, plugins]
file_type: rules
---

# Normalize compatibility input before runtime consumers

When a config migration is split from the behavior change that will consume it, the compatibility branch should end at the parser boundary. Parse canonical and legacy raw shapes exclusively, reject mixed authority, and immediately produce the same canonical runtime objects and indexes.

If existing shipped behavior still needs a legacy global value during the intermediate slice, derive that value from the canonical objects rather than retaining the raw legacy field. For a global target becoming per-pipeline targets, a temporary projection is valid only when every normalized pipeline has the same explicit target. Give that projection a named removal gate tied to the next consumer slice and completed config migration.

Manifest validation must mirror both exclusive raw branches because it runs before plugin runtime parsing. Runtime-only normalization cannot make a legacy shape reachable if the manifest rejects it first.
