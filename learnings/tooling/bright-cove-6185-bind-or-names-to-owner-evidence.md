---
title: "Bind OR names to owner evidence before writing the gate"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [deliberation, cross-repository, acceptance, tdd, provenance]
file_type: rules
---

# Bind OR names to owner evidence before writing the gate

When a cross-repository acceptance task references an external scenario assignment, do not infer missing OR names from older local readiness matrices. A later assignment can reuse the same IDs for different lifecycle behaviors.

Before editing the harness, require one immutable evidence bundle containing the owner commit, contract and fixture hashes, complete OR ID-to-name mapping, and exact external E2E selectors. Treat absent task-session logs, stale local provenance, checkout mismatch, and setup failures as blockers rather than behavioral RED.

Write the first TDD assertion with a descriptive behavior name when its OR ID is not yet proven. Assign the ID only after reading the accepted external mapping. This prevents a locally plausible gate from producing misleading named acceptance evidence.
