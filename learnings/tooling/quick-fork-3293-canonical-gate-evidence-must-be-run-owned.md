---
title: "Canonical gate evidence must be run-owned"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, provenance]
---

Passing local tests are not a substitute for evidence attached to the caller-owned canonical acceptance gate. The earlier follow-up was rejected because its results lacked that provenance, even though the checks had passed. Reuse the exact gate command in the current acceptance run and record its artifact or reference explicitly. Never reconstruct, infer, or relabel historical local output as canonical gate evidence.
