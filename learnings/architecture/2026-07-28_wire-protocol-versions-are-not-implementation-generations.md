---
title: "Wire protocol versions are not implementation generations"
date: 2026-07-28
category: architecture
component: shared
tags: [plugins, residue-audit, activation, wire-contract, authority]
file_type: checklist
---

# Wire protocol versions are not implementation generations

A residue scan can incorrectly classify current paths such as `/v1/*`, `*-v1.json`, or a version header as retired product behavior. Before treating a versioned match as residue, trace its owner and activation path.

For plugin audits, prove these separately:

1. Manifest and package identity: which module can be discovered and loaded.
2. Config normalization and aliases: which historical ids can reach that module.
3. Runtime registration: which hooks, services, tools, and control methods become executable.
4. Side-effect authority: how reservation or reconciliation reaches the sole sender call.
5. Version semantics: whether `v1` names the retired implementation or the current external wire contract.

In the Deliberation audit, provenance labeled `km-wire-v1.json` as the accepted Deliberation v2 interoperability protocol. Loader and sender tracing showed no retired id or fallback. The safe classification was therefore a false positive, not executable v1 residue.

Use literal scans to build the candidate ledger, but base `CLEAN` or `NOT CLEAN` on activation and authority proof rather than names alone.
