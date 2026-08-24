---
title: "Keep config-only repairs from importing wire drift"
date: 2026-08-21
category: architecture
component: shared
tags: [configuration, wire-contract, acceptance, scope-control]
---

The configuration migration had to preserve the existing `sourceThreadId` intake and KM wire behavior exactly. Verification compared the relevant wire fields and contract artifacts against `HEAD`, while canonical and legacy configuration inputs were normalized into one pipeline-based runtime representation. For configuration-only changes, treat stable wire contracts as explicit invariants: normalize compatibility at the parser boundary and verify that adjacent intake, serialization, and contract hashes have not drifted.
