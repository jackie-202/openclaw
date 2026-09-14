---
title: "Publikovane wire fixtures musi projit runtime consumerem"
date: 2026-09-10
category: architecture
component: general
tags: [wire-contract, fixtures, runtime-validation, deliberation]
file_type: rules
---

# Published wire fixtures must reach runtime consumers

Schema-valid published fixtures do not prove that the production client accepts the published response projection. A client can impose stricter historical requirements than the authoritative schema, so contract tests may pass while real responses fail at runtime.

For a pinned external wire contract, run each status-specific published response fixture through the actual client entry point. When the authoritative schema marks evidence fields optional, the parser should validate them when present rather than require them unconditionally. Keep the request-bound safety fences mandatory: immutable envelope and digest, attempt identity, outcome, provider, receipt or failure evidence, and any identity known from the request.

This distinction is especially important for completion and replay responses, where compact projections may omit reservation or invocation metadata that remains available in fuller record projections.
