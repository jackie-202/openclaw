---
title: "Plánování cross-repository kontraktu bez dostupných owner důkazů"
date: 2026-08-18
category: tooling
component: tooling
tags: [planning, cross-repository, contracts, provenance, fail-closed]
file_type: rules
---

# Plan cross-repository contract work around inaccessible owner evidence

When a planning task explicitly approves a read-only external checkout but the tool permission layer still blocks that directory, do not infer the owner contract from a stale local mirror or copy older provenance pins.

Build the plan from repository-local runtime types, adapters, tests, prior semantic checkpoints, and the caller's authoritative contract decision. Make the first implementation step an immutable-owner gate that reads only the named owner files plus clean tracked Git metadata. Require that gate before RED/GREEN product edits and before provenance changes.

For Deliberation, this also exposes useful drift: the runtime may already use the provider-neutral `{ provider, account, channel, threadId? }` shape while the checked-in mirror and integration expectations still use old generic names. Plan the smallest convergence around the mirror, overlay evidence, test expectations, and provenance rather than rewriting already-correct runtime ownership.
