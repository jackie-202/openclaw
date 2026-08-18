---
title: "Acceptance repairs must not invent draft authority"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, acceptance, dispatch, ownership, tdd]
file_type: decisions
---

Planning an acceptance repair must distinguish a missing implementation from a missing authority boundary. When no in-repository caller owns a complete draft-attempt envelope, adding a runner parameter, test fake, or session-derived adapter creates a second untrusted ingress rather than fixing stale continuations.

For Deliberation, the KM client exposes drafting fields only as a record projection, while the plugin registers intake, guards, history, and final delivery. The safe resolution is to require the external draft-dispatch owner to provide an authenticated typed ingress and canonical result recorder before implementation or TDD. A prior proof marked as a TDD skip cannot be reused as a historical RED.
