---
title: "Separate rollout readiness from local behavior proof"
date: 2026-08-17
category: architecture
component: backend
tags: [deliberation, slack, readiness, evidence, rollout]
---

The repository-local implementation and safety checks passed, including 226 Deliberation tests, destination-matrix coverage, sole-send checks, typechecks, formatting, and scoped review. The rollout verdict still remained `NOT READY` because required stable evidence from earlier batch slices and a mandatory proposal source were unavailable. Treat behavioral correctness and deployment readiness as separate gates: report verified local behavior precisely, but fail readiness closed when prerequisite ownership or provenance evidence cannot be inspected. Do not activate configuration merely because local tests pass.