---
title: "Authority migrations require indirect-consumer cleanup"
date: 2026-07-25
category: architecture
component: backend
tags: [model-resolution, pricing-cache, session-reconstruction, dispatch]
---

Removing runtime-profile model ownership affected more than the primary resolver. Delivery-mode selection, native `/status`, reconstructed gateway session rows, and configured-model pricing collection also consumed or exposed the selected model. The pricing cache had to stop scanning `runtimeByChannel`, and session/status paths had to use `modelByChannel` while preserving supplemental runtime fields. For authority migrations, search for reporting, caching, reconstruction, and policy consumers in addition to the obvious execution path.