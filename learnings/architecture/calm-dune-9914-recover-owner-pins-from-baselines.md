---
title: "Recover Owner Pins From Repository Baselines"
date: 2026-08-17
category: architecture
component: shared
tags: [provenance, contracts, deliberation, testing]
file_type: rules
---

# Recover Owner Pins From Repository Baselines

When a provenance repair replaces an accepted immutable owner pin with an
unresolved placeholder, inspect the repository baseline before declaring the
owner evidence unavailable. A baseline manifest can provide the exact revision
and owner-relative hash map without deriving either from semantic handoffs or
local mirror hashes.

Keep three evidence classes separate in both the test and the final note:

- Semantic handoff evidence explains compatible contract meaning.
- Owner provenance pins the external owner revision and source-file hashes.
- Local hash evidence verifies copied repository artifacts independently.

Introduce the accepted-pin assertion before restoring the manifest so the RED
failure proves the missing owner state, then rerun it after the repair. If the
repository test lock is held, wait for its owner rather than bypassing it.
