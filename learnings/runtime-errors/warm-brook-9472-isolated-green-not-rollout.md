---
title: "Isolated GREEN is not active rollout proof"
date: 2026-08-18
category: runtime-errors
component: backend
tags: [deliberation, gateway, rollout, delivery]
file_type: checklist
---

# Isolated Green Is Not Active Rollout Proof

For an already-implemented durable delivery service, an isolated test that drives `READY_TO_SEND` through reservation, invocation, one fake-provider call, receipt completion, and `SENT` proves the source contract only. It does not establish that the serving Gateway loaded and started that service.

When the active queue still has a ready item with no reservation, retain the single sender and require the host owner's deploy verifier, full serving-Gateway restart, then read-only evidence for the named record: `SENT`, one attempt, one provider message ID, and one visible reply. Do not substitute a guessed deploy command, manual reservation, provider send, or SQLite mutation.
