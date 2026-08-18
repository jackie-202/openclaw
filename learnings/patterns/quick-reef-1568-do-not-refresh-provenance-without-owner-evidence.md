---
title: "Do not refresh provenance without owner evidence"
date: 2026-08-17
category: patterns
component: shared
tags: [provenance, contracts, hashes, external-owner]
---

Semantic convergence was implemented and tested, but the exact replacement KM owner revision and hashes were unavailable. The contract evidence recorded the unresolved owner pin without claiming a stale or invented hash. When an external owner supplies protocol provenance, update pins only from verifiable owner artifacts; semantic test success is not evidence for a specific external revision.