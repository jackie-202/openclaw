---
title: "Same-command TDD provenance cannot be inferred from passing verification"
date: 2026-08-21
category: tooling
component: tooling
tags: [tdd, acceptance, evidence, provenance, testing]
file_type: rules
---

# Same-command TDD provenance cannot be inferred from a passing rerun

For an evidence-only acceptance repair, a fresh passing run of the required focused command proves current behavior but does not establish a TDD cycle. Historical RED is credible only when task/session evidence contains the identical command, a nonzero outcome, and a failure tied to the repaired behavior.

When lineage extraction reports only another command or `outcome_unavailable`, record `historical_red_unavailable` and preserve the passing run as verification-only evidence. Do not mutate already-correct tests or production code to manufacture a RED after implementation.

Repository test wrappers can queue behind the local heavy-check lock. A timeout while waiting for that lock is not a test failure; retry with a longer timeout without killing the lock owner.
