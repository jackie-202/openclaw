---
title: "Gate implementation on accepted wire contracts"
date: 2026-08-14
category: architecture
component: shared
tags: [contracts, dependency-gate, schema, delivery-routing]
---

The delivery-target implementation was intentionally stopped because the repository-local KM contract snapshot did not define either the optional intake `deliveryTarget` or the required effective target in the durable delivery envelope. Provenance also pointed to an older contract snapshot. Reuse this dependency-gate pattern when another subsystem owns a wire format: verify both schema fields and contract provenance before writing tests or production code. Do not invent a locally convenient payload shape, because that can create incompatible persisted messages and false RED/GREEN evidence.