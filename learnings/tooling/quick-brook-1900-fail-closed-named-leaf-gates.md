---
title: "Canonical evidence gates must stop before inventing leaves"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, evidence, provenance, fail-closed, deliberation]
file_type: rules
---

# Canonical evidence gates must stop before inventing leaves

An aggregate integration suite cannot be relabeled into a named acceptance matrix. A canonical gate should extract exact reporter selectors from the owning tests, bind them to one current run and immutable authority, and reject missing or duplicate selectors. Reporter totals and historical Green output are supporting context only.

For cross-repository gates, preflight is part of command identity: verify the exact owner checkout path, revision, scoped cleanliness, and every accepted file hash before behavioral execution. A dirty caller checkout, stale provenance, or inaccessible owner source is a setup blocker. It is safer to leave the final ledger absent than to add fixture-only tests or synthetic Green rows.

The readiness consumer should read only the validated final ledger. Until that artifact exists, repository readiness remains unknown; deployment, live activation, provider authenticity, and pilot readiness stay separate decisions even after a repository gate eventually becomes Green.
