---
title: "Povinná pole obálky vyžadují synchronizaci celého kontraktu"
date: 2026-08-14
category: architecture
component: backend
tags: [deliberation, contracts, fixtures, durable-delivery]
file_type: checklist
---

# Required envelope fields must update the full contract bundle

When a durable wire envelope gains a required field, updating only the schema and runtime parser is insufficient. Every accepted ready, reservation, invocation, completion, and projection fixture that embeds the envelope must gain the field too, and provenance hashes must be refreshed after the complete bundle is synchronized.

For Deliberation routing, the effective `deliveryTarget` belongs in the KM-owned reservation envelope. The plugin injects an optional operator override only at intake, then ignores mutable config during delivery. Provider invocation, invocation evidence, and completion evidence all consume the same reserved string.

A focused adapter RED catches source-versus-target routing, but contract fixture drift requires separate contract assertions or structured review. After adding a required envelope field, search every fixture for embedded envelope objects rather than only the ready and reservation response examples.
