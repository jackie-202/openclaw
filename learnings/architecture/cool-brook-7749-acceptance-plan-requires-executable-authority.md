---
title: "Acceptance planning needs an executable authority boundary"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, acceptance, dispatch, ownership, tdd]
file_type: decisions
---

# Acceptance planning needs an executable authority boundary

When an acceptance retry asks for attempt fencing, first inspect the actual caller, wire contract, and result recorder. A record projection that contains optional attempt metadata does not authorize OpenClaw to start a run or accept its result.

For Deliberation, the local contract exposes only health, ready, intake, reservation, invocation, and completion. Until the KM owner supplies an authenticated draft-dispatch ingress and canonical result recorder, a local embedded-runner adapter or RED test would create an untrusted second ingress. The repair plan must make the owner revision a hard dependency and require fresh RED/GREEN proof after it lands.
