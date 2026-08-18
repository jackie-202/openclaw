---
title: "Deliberation continuations need trusted dispatch ingress"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, continuation, dispatch, ownership]
---

Do not add a drafting-dispatch path merely because the embedded runner can accept continuation parameters. The Deliberation extension currently owns intake, isolation guards, history reads, and final delivery, but has no in-repo producer capable of supplying an authoritative attempt envelope.

Deriving attempt identity or dispatch inputs from channel or session state would create an untrusted parallel ingress and violate the ownership boundary. Implement attempt-pinned continuations only after a trusted producer and closed envelope contract exist; otherwise record the decision-gate blocker rather than inventing a new dispatch module.