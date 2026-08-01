---
title: "Posouzení proveditelnosti pluginu vyžaduje mapu autority"
date: 2026-07-27
category: architecture
component: shared
tags: [openclaw, plugins, hooks, delivery, investigation]
file_type: rules
---

# Plugin feasibility investigations need an authority map

When a task asks whether a normal external OpenClaw plugin can enforce a workflow, hook names and bundled examples are insufficient evidence. Build the investigation around four separate facts:

1. The documented public SDK contract.
2. The current hook runner and call-site behavior, including timeout and failure policy.
3. Whether the API is available to external plugins or only bundled/trusted plugins.
4. Every alternate path that can bypass the proposed gate, especially the message tool, direct adapter sends, session/subagent delivery, and recovery queues.

Trace inbound and outbound paths end to end before assigning ownership. For delivery guarantees, distinguish attempt reservation, provider acceptance, platform message ID, visible delivery, unknown outcome, and reconciliation; a durable queue or receipt does not by itself prove exactly-once visible delivery.

For investigation-only tasks, use existing focused characterization tests only to resolve source ambiguity. Do not invent production tests or implementation changes, and keep missing external orchestration contracts as explicit stop conditions.
