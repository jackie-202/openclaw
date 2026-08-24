---
title: "Canonical Test Gate evidence nelze rekonstruovat"
date: 2026-08-20
category: tooling
component: ci-cd
tags: [acceptance, test-gate, vitest, evidence]
file_type: rules
---

# Canonical Test Gate Evidence Cannot Be Reconstructed

When acceptance names a caller-owned Test Gate, local Vitest totals in a
checkpoint do not satisfy the requirement. Preserve the exact focused and
broader commands, then record the gate's concrete non-`not-run` reference,
exit codes, and complete totals in a dedicated artifact. Keep the source and
tests unchanged for an evidence-only retry unless that gate exposes a real
regression.
