---
title: "Channel model authority requires effective projection audits"
date: 2026-08-09
category: architecture
component: backend
tags: [openclaw, model-authority, status, gateway, fallback-provenance]
file_type: checklist
---

# Channel model authority requires effective projection audits

A canonical configuration authority does not guarantee that every projection exposes the same effective model. In OpenClaw channel audits, inspect these layers separately:

- configured channel intent from `modelByChannel`;
- explicit session or one-turn selection;
- visibility-policy normalization;
- automatic fallback provenance and stale-pin repair;
- last-run runtime identity;
- native status and Gateway row projections.

A fast status path can display the configured model before visibility policy or runtime fallback changes it. A Gateway row can instead retain last-run identity or show the agent default before the first channel run. Both can coexist with correct ordinary-turn model authority.

When a channel default changes, test provenance-bearing automatic fallbacks on ordinary and heartbeat turns separately. Heartbeat-only stale repair can leave the previous fallback masking the new channel default during normal traffic.

Compatibility reports should distinguish authority preservation from execution parity and display parity. Close status, Gateway, and stale-state gaps at their owners; do not recreate a retired persistent model field.