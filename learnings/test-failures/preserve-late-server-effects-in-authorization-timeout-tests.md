---
title: "Preserve late server effects in authorization timeout tests"
date: 2026-09-14
category: test-failures
component: backend
tags: [deliberation, timeout, authorization, fake-timers]
file_type: rules
---

# Preserve late server effects in timeout tests

For a pre-send authorization timeout, an adapter-level test that only mocks an
immediate `invoke` rejection cannot show what happens when the server authorizes
after the client has already aborted. Use fake time and an abort-aware client
transport: reject the client promise on the timeout signal, but schedule the
server-side authorization record independently. Assert the late durable record
exists and that the adapter still made zero provider and completion calls.

When this is an evidence-only follow-up after the implementation shipped, link
the historical RED and capture fresh GREEN output instead of inventing a RED.
