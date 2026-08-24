---
title: "Reachable owner history bounds cross-repository acceptance evidence"
date: 2026-08-22
category: tooling
component: shared
tags: [deliberation, cross-repository, acceptance, provenance, git-history]
file_type: rules
---

# Reachable owner history bounds cross-repository acceptance evidence

When an acceptance repair requires an approved producer revision, inspect the supplied owner's complete reachable refs before rerunning an expensive cross-repository gate. A clean hash-matched checkout is insufficient if its executable validator predates the accepted wire shape, while a newer runtime is insufficient if its tracked owner files no longer match the accepted hashes.

For the Deliberation gate, the sole owner branch contained no revision satisfying both layers. The only revision with both accepted contract blobs rejected `pipelineId`, intake `deliveryTarget`, and target `mode`. Latest owner `main` accepted the first two fields but changed both owner hashes and still closed targets without `mode`. Searching every reachable runtime revision confirmed that mode support never existed.

In this state, rerunning the accepted revision only repeats the genuine RED, and running latest `main` only fails provenance preflight. The correct evidence outcome is an explicit owner-boundary block, not a patched checkout, stripped consumer payload, refreshed pin, or claimed GREEN. Preserve external/live convergence as unknown until an immutable owner-approved revision passes the unchanged consumer gate.
