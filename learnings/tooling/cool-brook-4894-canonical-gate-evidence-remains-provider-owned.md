---
title: "Canonical gate evidence remains provider-owned"
date: 2026-08-20
category: tooling
component: ci-cd
tags: [acceptance, test-gate, vitest, crabbox, evidence]
---

Local focused suites can establish implementation health but cannot replace a required canonical-provider test gate. When the local heavy-check lock is held, wait for it rather than interrupting another task. If remote execution is unavailable, record exact blockers separately: the AWS route required missing broker authentication and Blacksmith Testbox required an unavailable CLI. Preserve local passing results as local evidence without presenting them as canonical evidence.
