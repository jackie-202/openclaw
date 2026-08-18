---
title: "Executable cross-repository contracts can drift from copied schemas"
date: 2026-08-14
category: test-failures
component: e2e
tags: [contract-drift, cross-repo, closed-schema, integration-testing]
---

The OpenClaw producer correctly emitted the configured `deliveryTarget`, but the available KM listener rejected intake with `400 SCHEMA_INVALID` because its closed intake schema did not yet accept that field. Unit tests against the copied contract passed, while the real cross-repository integration failed.

Reuse real producer-to-listener tests whenever a protocol spans repositories. Treat the deployed executable schema as authoritative evidence and report version skew explicitly rather than weakening the harness or removing a valid field to make tests pass.