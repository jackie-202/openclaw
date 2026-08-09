---
title: "Acceptance blockers need factual proof provenance"
date: 2026-08-07
category: architecture
component: shared
tags: [acceptance, deliberation, tdd, evidence]
file_type: rules
---

# Acceptance blockers need factual proof provenance

When a task permits an evidence-backed blocker, put the required capability, inspected public APIs, exact incompatibility, and smallest proposed seam in the task-result artifact itself. A checkpoint that merely discusses those facts is not a substitute for the task result.

Do not reuse a historical RED unless its source records the actual failing command and result. If the adapter has not been implemented but its external contract is still absent, do not create behavior tests that invent the missing schema; record TDD as blocked and capture a fresh RED/GREEN only after the authoritative contract exists.
