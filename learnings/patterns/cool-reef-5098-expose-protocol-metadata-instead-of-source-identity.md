---
title: "Expose protocol metadata instead of source identity"
date: 2026-08-26
category: patterns
component: backend
tags: [health-contract, encapsulation, closed-schema, provenance]
---

Health and provenance contracts exposed source filenames and external implementation hashes as authority evidence. Those fields coupled consumers to repository layout without proving runtime compatibility.

The replacement exposes only closed public health, version, control, runtime, and protocol metadata, while provenance pins repository-local contract artifacts. Health responses can omit source-file identity and still be valid, including degraded responses, but malformed nested public projections remain fail-closed.

Reuse this pattern for service boundaries: publish stable protocol revisions and bounded runtime state, not file paths or source hashes. Keep provider- or implementation-specific evidence in the owning adapter or repository.
