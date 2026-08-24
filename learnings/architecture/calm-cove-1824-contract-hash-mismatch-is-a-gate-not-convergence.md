---
title: "Contract hash mismatch is a gate, not convergence"
date: 2026-08-22
category: architecture
component: shared
tags: [contracts, provenance, cross-repo, hashes, fail-closed]
---

Cross-repository scenarios could not run because the KM owner contract and fixture hashes differed semantically from the locally accepted contract. The implementation correctly recorded the mismatch and live status as unknown instead of updating provenance to imply convergence. Treat owner-contract hash mismatches as a preflight gate: preserve the accepted local provenance, do not claim adoption, and require explicit synchronization before integration execution.
