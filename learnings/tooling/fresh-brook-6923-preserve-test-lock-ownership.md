---
title: "Preserve Test Lock Ownership During Contract-Gate Closeout"
date: 2026-08-17
category: tooling
component: ci-cd
tags: [testing, vitest, contract-gate, provenance]
file_type: rules
---

# Preserve Test Lock Ownership During Contract-Gate Closeout

When a focused OpenClaw test waits on the local heavy-check lock, do not bypass
the lock with a concurrent Vitest invocation or terminate the owning process.
Record that the test did not start, including the exact command and timeout,
then preserve the fail-closed contract decision. A test-lock timeout is not
semantic or provenance evidence and cannot justify a manifest change.
