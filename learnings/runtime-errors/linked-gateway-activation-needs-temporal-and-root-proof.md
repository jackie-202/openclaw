---
title: "Linked Gateway activation needs temporal and root proof"
date: 2026-08-25
category: runtime-errors
component: backend
tags: [openclaw, gateway, deployment, plugins, deliberation, idempotency]
file_type: checklist
---

# Linked Gateway activation needs temporal and root proof

For a source-linked managed Gateway, a fresh build and a successful plugin inspection still do not prove that the serving process uses the new artifact. Activation evidence must bind three identities:

1. The emitted plugin chunk that contains the intended behavior, including its hash and modification time.
2. The global linked CLI and managed-service package root, both resolving to the same checkout.
3. A replacement Gateway PID whose process start is later than the final artifact modification time.

After restart, combine the new PID with plugin-owned RPC health, emitted runtime registration, and post-boundary logs. Keep live behavior separate: an error-free restart proves activation and health, but exactly-once delivery requires a fresh naturally produced record with one attempt, one provider message ID, terminal `SENT`, and no duplicate. Historical terminal records remain read-only sentinels and must never be recycled to manufacture that proof.
