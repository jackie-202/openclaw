---
title: "Cross-repository delivery tests need one guarded readiness seam"
date: 2026-08-14
category: architecture
component: e2e
tags: [deliberation, integration-tests, km, delivery-fencing, fake-provider]
file_type: rules
---

# Cross-repository delivery tests need one guarded readiness seam

When OpenClaw must prove final delivery against a real isolated KM listener/spool, keep the listener, HTTP client, reservation, invocation, and completion paths real. Fake only the outbound provider so exact destination, text, count, and receipt evidence remain observable without a live Discord send.

Intake alone leaves a fresh Deliberation record in `DEBOUNCING`, so final-routing coverage needs a deterministic way to produce a reviewed `READY_TO_SEND` record. Add that operation to the existing test-only spool probe only when the KM library exposes a public fixture or transition API. Preserve sentinel, containment, and production-root overlap checks before every spool constructor; never mutate guessed SQLite tables or reproduce KM transition logic in TypeScript.

Keep the identities independently asserted:

- `sourceTarget` and source/freshness provenance remain source A.
- `processingSource` is a separate configured route and is never the delivery destination.
- The durable envelope's `deliveryTarget` is A by default or operator override B.
- Invocation, provider addressing, and completion all use the identical reserved target.

Test mismatched attempted targets through the real listener before any provider call, then re-read the spool to prove fail-closed rejection did not persist conflicting evidence.
