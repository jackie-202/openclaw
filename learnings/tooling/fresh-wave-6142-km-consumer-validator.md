---
title: "Verify Deliberation Provenance Through Its KM Consumer"
date: 2026-08-17
category: tooling
component: ci-cd
tags: [deliberation, provenance, validator, testing]
file_type: rules
---

# Verify Deliberation Provenance Through Its KM Consumer

The Deliberation provenance manifest has a local contract test, but acceptance
by the KM owner requires the separate
`pnpm test:deliberation:km-integration` consumer validator. That command first
requires `OPENCLAW_DELIBERATION_KM_ROOT`, a listener at
`scripts/deliberation-v2-listener.py`, and the KM Python environment. It checks
the manifest `ownerFiles` hashes before running integration assertions.

Do not infer validator acceptance from a matching local hash or a focused
Vitest pass. If the trusted KM checkout is unavailable or missing the listener,
record the exact blocked prerequisite and leave production provenance unchanged.
