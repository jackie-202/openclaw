---
title: "Acceptance follow-ups must preserve external blockers"
date: 2026-08-09
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, provenance]
file_type: rules
---

# Acceptance follow-ups must preserve external blockers

When an acceptance finding specifically requires caller-owned Test Gate provenance, an implementation session should first inspect the immutable acceptance result and look for a retry manifest or gate artifact. If the result still says `not run` and no retry artifact exists, rerunning the same tests locally is not verification progress and must not be labeled canonical evidence.

Record the blocker with the source run ID, artifact paths, repository revision, inspection timestamp, and the exact matrix the caller must provide. Keep historical RED/GREEN proof linked as implementation provenance, but do not use it to replace a separately required gate. This prevents repeated evidence-only tasks from accumulating local runs while the actual external dependency remains unresolved.
