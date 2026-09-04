---
title: "Canonical gate evidence starts at allocation"
date: 2026-08-25
category: tooling
component: ci-cd
tags: [acceptance, test-gate, provenance, crabbox]
file_type: rules
---

# Canonical gate evidence starts at allocation

An evidence-only acceptance follow-up must keep three claims separate:

1. The historical RED/GREEN artifact proves the implementation-after-test sequence.
2. A fresh identical local GREEN proves the preserved workspace still has the intended behavior.
3. A canonical Test Gate proves the required matrix only when its provider allocates and returns a durable run reference.

If Blacksmith, Crabbox, or another caller-owned runner fails before allocation, there is no canonical run to cite. Record the provider, requested command, exact pre-allocation error, and `BLOCKED` status. Local plugin tests, lint, type checks, and builds remain useful supplementary evidence, but must not be relabeled as the missing canonical gate.

When `task-evidence` writes to the same artifact path as hand-written evidence, run it first or append candidate provenance afterward. Preserve its `outcome_unavailable` and truncation gaps verbatim; use the underlying proof or gate artifact for concrete exit codes rather than rewriting generated lineage.
