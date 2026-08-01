---
title: "External protocol authority must precede plugin implementation"
date: 2026-07-27
category: architecture
component: backend
tags: [external-contract, plugin, protocol, delivery-semantics]
---

The Deliberation v2 plugin could not be implemented safely because the repository contained only architectural shapes, not an owner-approved KM wire contract. Critical details were unspecified, including authentication, endpoints, schemas, missing-message behavior, cursor and lease semantics, CAS conflicts, reconciliation, and proof that a message was not sent. Acceptance requirements do not create protocol authority. When retry and delivery correctness depend on an external system, stop before production code rather than inventing behavior; require executable fixtures or an approved contract covering every security- and idempotency-sensitive operation.
