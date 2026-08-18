---
title: "Deliberation: oddělit generický owner wire od provider overlay"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, contracts, wire-schema, provider-adapters, provenance]
file_type: rules
---

# Deliberation owner mirrors and provider overlays are separate contracts

When KM owns a provider-generic wire target such as `{ provider, accountId, channelId, threadId? }`, OpenClaw must mirror that generic shape exactly at durable HTTP boundaries. Provider-specific restrictions, such as Slack timestamp grammar or the set of adapters OpenClaw can actually load, belong in `delivery-target.ts`, plugin configuration, and adapter tests rather than in the owner mirror.

This separation matters during convergence work: broadening the mirror to match KM must not silently weaken useful OpenClaw validation, while local provider fixtures must not be inserted into a file whose provenance claims byte-level owner mirroring. Keep local overlay fixtures explicitly named and hashed separately.

Refresh provenance only after semantic assertions pass. If a handoff establishes behavior but omits a replacement owner revision or file hash, update computable local hashes and record the missing exact pin as a follow-up; never retain a stale byte-identical claim or fabricate an owner hash.
