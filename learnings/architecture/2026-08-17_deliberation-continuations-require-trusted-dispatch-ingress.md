---
title: "Deliberation continuations require a trusted dispatch ingress"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, continuation, dispatch, ownership]
file_type: decisions
---

An attempt-pinning implementation cannot begin at the generic embedded-runner continuation path when the repository has no trusted caller that creates the drafting run.

For Deliberation, `index.ts` registers only source intake/suppression, outbound guards, history reads, and final delivery. Intake posts source events to KM; the KM client exposes drafting details only as an optional record projection. Neither path invokes the embedded runner or has authoritative values for attempt, correlation ID, payload/result paths, and reply/run ID.

Do not infer those fields from a channel message, session transcript, payload filename, or prior record. A new local dispatch helper would be an untrusted second ingress and could make stale continuation replay worse. Stop at the ownership gate and require the external drafting-dispatch owner to provide a typed OpenClaw ingress carrying the complete envelope.
