---
title: "Keep acceptance repairs scoped to the unmet owner boundary"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, tdd, cross-repository, durable-state, scope]
file_type: rules
---

# Keep acceptance repairs scoped to the unmet owner boundary

When an acceptance retry names only durable one-event/one-record semantics, do not repeat already-complete channel ingress or bundle adjacent delivery-state repairs merely because the task title still mentions them. Trace the finding to its owner: OpenClaw already emits one authenticated intake call per event, while the external KM owner still groups calls into burst records.

The genuine RED must therefore run through the owner listener and durable SQLite projection. Add two distinct same-window events plus exact replay to `pnpm test:deliberation:km-integration`; require two distinct record/inbound identities and an unchanged count after replay. Contract checkout failures and provenance hash mismatches remain preconditions, not RED.

Only after the owner runtime defines the singular record shape should OpenClaw mirror the contract, parser, probe, and hashes. This keeps the consumer from inventing external fields and prevents locally green intake-call tests from being mistaken for durable behavior proof.
