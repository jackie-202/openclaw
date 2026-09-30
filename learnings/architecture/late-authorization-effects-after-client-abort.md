---
title: "Pozdni autorizace musi zustat viditelna po klientskem abortu"
date: 2026-09-14
category: architecture
component: backend
tags: [deliberation, timeout, authorization, testing]
file_type: rules
---

# Preserve late authorization effects after client aborts

A timeout test for a pre-send authorization must model two independent outcomes: the client request rejects when its abort signal fires, while server-side authorization can persist later.

Use fake timers and an abort-aware transport that rejects on `init.signal.abort` but schedules the durable authorization record separately. Advance through the abort first and prove provider delivery and completion have not run; then advance through the server delay and assert the exact invocation identity was recorded while those calls remain at zero.

Do not retry the adapter in this characterization. The late record establishes authorization ambiguity, and the assertion protects the fail-closed boundary before the provider send.
