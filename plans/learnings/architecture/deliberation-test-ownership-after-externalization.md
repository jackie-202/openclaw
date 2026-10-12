---
title: "Deliberation test ownership after externalization"
date: 2026-10-05
category: architecture
component: general
tags: [openclaw, plugins, deliberation, testing]
file_type: rules
---

When externalizing a plugin, plugin-source tests and host-native adapter tests cover different seams. Keep generic host coverage for pre-debounce policy timing, exclusive targeted claims, terminal no-fallthrough, native identity/route facts, duplicate envelopes, and ordinary-side-effect suppression. Keep plugin config, wire serialization, KM protocol, and private state assertions with the external owner. Use a synthetic hook owner for host tests; claim installed-package parity only after testing an actual installed package fixture. Treat real-provider proof as a separate claim.
