---
title: "Deliberation continuation fencing requires KM dispatch authority"
date: 2026-08-17
category: architecture
component: shared
tags: [deliberation, km, continuations, authority, fencing]
file_type: rules
---

An authenticated gateway method is not, by itself, authority to start a Deliberation draft continuation. The KM wire must first define its authenticated dispatch endpoint, complete immutable attempt envelope, canonical result recorder, and stale or duplicate outcomes.

In this checkout, `km-wire-v1.json` exposes only health, ready, intake, reservation, invocation, and completion endpoints. The optional `record.drafting` projection and `record.processing` status fields cannot be used to derive dispatch authority. Starting an embedded run from either projection, a session, or inbound content would create an untrusted second ingress and invalidate stale-attempt fencing.

When this condition is found, retain the explicit owner dependency, test the existing closed contract, and wait for the owner-selected ingress rather than adding a local gateway or runner path.
