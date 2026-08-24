---
title: "Owner hash convergence is not behavioral intake convergence"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [tdd, provenance, cross-repository, deliberation]
file_type: rules
---

# Owner hash convergence is not behavioral intake convergence

The Deliberation cross-repository preflight can accept the exact owner contract and fixture hashes while the owner listener still rejects the current OpenClaw intake envelope. In `cool-wave-8905`, the pinned KM workspace matched `provenance.json`, but its contract and runtime still omitted the current `pipelineId`, effective `deliveryTarget`, and delivery-target `mode`; the first authenticated intake therefore returned `SCHEMA_INVALID`.

For owner-backed RED-GREEN work, distinguish three gates:

1. The checkout is readable and contains the listener and test environment.
2. Owner file hashes match the declared provenance.
3. The executable owner runtime accepts the mirrored request shape and reaches the assertion under test.

Only a failure after gate 3 can be behavioral RED. A missing listener, hash mismatch, or schema rejection before durable admission is setup/provenance evidence and must not be written as TDD RED. Do not repair this by changing the consumer mirror or pinning hashes to a stale runtime; obtain an owner-approved repository revision and change the authoritative contract, listener, and storage implementation together.
