---
title: "Repository-only compatibility audits separate authority from state"
date: 2026-08-09
category: architecture
component: backend
tags: [openclaw, compatibility-audit, model-authority, migration-evidence]
file_type: rules
---

# Repository-only compatibility audits separate authority from state

When auditing a fork invariant against upstream, build the scenario matrix from immutable revisions before interpreting current behavior. Trace persisted configuration, explicit session overrides, automatic fallback provenance, runtime history, and status projection as separate owners; matching output does not prove matching authority.

For channel model compatibility, `modelByChannel` can preserve canonical model selection while still missing fork behavior in ordinary-turn stale fallback repair, reconstructed-session projection, or model-free runtime supplements. Do not revive a retired model field to close those gaps.

Migration evidence must be bounded by retained artifacts. A current canonical config shape can show that migration likely occurred, but it cannot prove backup equality, dry-run, apply, doctor, or rollback. Report those as evidence gaps rather than reconstructing success from current state.
