---
title: "External contract gates precede behavioral TDD"
date: 2026-07-28
category: architecture
component: general
tags: [openclaw, plugins, external-authority, tdd, contracts]
file_type: rules
---

# External contract gates precede behavioral TDD

For a plugin whose behavior is owned by an external authority, verify that the
accepted wire fixtures actually exist in the repository before creating even an
inert scaffold. A plan may prescribe the later RED test while separately making
the fixture bundle a prerequisite; the prerequisite controls execution order.

If versioned schemas, provenance hashes, authentication rules, delivery outcome
fixtures, reconciliation semantics, or persisted control contracts are absent,
stop and list each missing artifact. Do not turn a missing file, import error, or
invented mock protocol into behavioral RED evidence, and do not claim an empty
GREEN merely to satisfy an artifact shape.

Checkpoint and proof files should preserve the blocker honestly so a resumed
task can continue when the owner-approved bundle arrives without mistaking the
blocked run for completed TDD.
