---
title: "Composed ingress tests must assert terminal hook outcomes"
date: 2026-08-03
category: test-failures
component: backend
tags: [openclaw, discord, deliberation, inbound-hooks, acceptance]
file_type: rules
---

# Assert terminal hook outcomes at the composed ingress boundary

A loader-backed channel integration can prove payload serialization and downstream suppression while still failing to prove why dispatch stopped. Assertions such as "ordinary dispatch was not called" are compatible with several short-circuit paths.

For terminal inbound hooks, capture the composed hook mock's returned promise and assert its closed result directly:

```ts
await expect(intakeHandler.mock.results[0]?.value).resolves.toEqual({ handled: true });
```

Keep this alongside payload assertions and direct plugin tests. The combination proves that the live-shaped inbound event emitted the canonical body and that successful durable intake, rather than an unrelated guard, terminally claimed the event.

For acceptance follow-ups where production code already exists, preserve the genuine parent RED artifact and capture fresh GREEN evidence. Do not fabricate a new RED by temporarily reverting production behavior.
