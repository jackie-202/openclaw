---
title: "Provider-neutral mirror verification must be semantic and executable"
date: 2026-08-18
category: architecture
component: shared
tags: [deliberation, contracts, provider-neutral, provenance, fencing]
file_type: checklist
---

# Provider-neutral mirror verification must be semantic and executable

For the Deliberation cross-repository contract, matching provenance hashes is not enough. The OpenClaw mirror can still be stale while `provenance.json` correctly pins the current KM owner files.

The reliable sequence is:

1. Read the canonical owner `deliveryTarget` schema and compare parsed JSON recursively against the local mirror.
2. Keep the generic wire limited to `provider`, `account`, `channel`, and optional `threadId`; do not reuse source-provider grammar or enumerate concrete transports there.
3. Convert generic fields to OpenClaw's provider-owned `accountId`/`channelId` shape only at the final adapter boundary.
4. Validate the provider overlay before creating a durable reservation. Otherwise an unsupported provider or invalid Slack thread can consume a reservation before failing.
5. Exercise the isolated canonical verifier through all seven tests. Provenance preflight alone does not prove routing, thread preservation, or invocation/completion fencing.
6. Refresh local mirror and fixture hashes only after semantic equality and executable verification succeed.

Also keep `sourceThreadId` separate from destination `threadId`: default delivery may derive a threaded destination from source identity, while an explicit destination can omit or independently set its thread according to provider policy.
