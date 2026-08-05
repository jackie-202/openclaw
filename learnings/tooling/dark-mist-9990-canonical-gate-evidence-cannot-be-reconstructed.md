---
title: "Canonical gate evidence cannot be reconstructed from local success"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, provenance]
file_type: rules
---

# Canonical gate evidence cannot be reconstructed from local success

When acceptance names a caller-owned Test Gate, local test output, session summaries, and checkpoint claims remain supporting context only. A follow-up must obtain an inspectable canonical reference that identifies the required command or test surfaces; relabeling a local run does not repair `canonical:not-run`.

For evidence-only retries, preserve the historical RED, capture only fresh GREEN evidence, and keep production/test files unchanged unless the canonical output demonstrates a real defect. Record missing, blocked, or truncated gate fields explicitly instead of inferring success.
