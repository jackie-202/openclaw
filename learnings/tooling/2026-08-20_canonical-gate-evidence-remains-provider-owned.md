---
title: "Canonical gate evidence remains provider-owned"
date: 2026-08-20
category: tooling
component: ci-cd
tags: [acceptance, test-gate, vitest, crabbox]
file_type: rules
---

# Canonical Test Gate Evidence Cannot Be Replaced By Local Results

For acceptance follow-ups that explicitly require a caller-owned Test Gate, run
the exact focused commands locally for diagnosis, but do not label that output
as canonical evidence. The gate artifact must retain a concrete non-`not-run`
run reference from the configured provider.

If an isolated gate cannot start because its broker credentials or delegated
runner are unavailable, preserve the exact provider failure beside the local
passing totals. That keeps the implementation verdict honest and gives the
caller the two commands needed for the authoritative rerun.
