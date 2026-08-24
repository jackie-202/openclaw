---
title: "Keep runtime validation aligned with JSON Schema"
date: 2026-08-21
category: patterns
component: shared
tags: [zod, json-schema, validation, canonical-identities]
---

A final audit found that Zod trimmed pipeline identity fields before validating them, while the plugin JSON Schema rejected padded values. This made acceptance depend on which validation path ran and silently rewrote identities. The runtime validator was tightened to reject surrounding whitespace as the manifest does. For identifiers used as keys or routing authority, validate the exact supplied value rather than normalizing it silently, and add parity tests across runtime and manifest validation.
