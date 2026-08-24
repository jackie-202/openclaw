---
title: "Acceptance GREEN must match the historical RED command"
date: 2026-08-21
category: tooling
component: tooling
tags: [tdd, acceptance, evidence, contract-tests]
file_type: rules
---

# Acceptance GREEN must match the historical RED command

When an acceptance plan names an identical contract-gate command for RED and GREEN, a passing neighboring suite is not interchangeable evidence. Preserve the genuine pre-implementation RED by linking its original proof, then rerun the exact command with the same target and relevant environment settings against the completed implementation.

For evidence-only follow-ups:

1. Do not fabricate a new RED after implementation exists.
2. Link the original proof, command, failure, and provenance.
3. Run the exact contract gate named by the plan.
4. Record the complete fresh output, exit code, and passing counts under `## GREEN Phase`.
5. Avoid production changes unless that exact gate reveals a real defect.

This distinction matters because a broad behavioral suite may pass while the owner contract gate remains stale or unproven.
