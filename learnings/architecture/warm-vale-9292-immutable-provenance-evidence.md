---
title: "Provenance Refresh Requires Immutable Commit Evidence"
date: 2026-08-18
category: architecture
component: shared
tags: [deliberation, provenance, contracts, verification]
file_type: checklist
---

# Provenance Refresh Evidence Must Carry an Immutable Commit

An owner-file SHA-256 map is insufficient if the provenance revision is a task label rather than an immutable repository commit. Before refreshing the manifest, independently prove the relevant owner files are tracked and clean against `HEAD`, capture the exact commit and SHA-256 values, then run semantic contract coverage.

Record that sequence in a task final note: owner gate, hashes, semantic test, manifest refresh, and canonical integration verifier. This makes it possible to distinguish a current semantically gated pin from a stale hash-only refresh without relying on checkpoint summaries.
