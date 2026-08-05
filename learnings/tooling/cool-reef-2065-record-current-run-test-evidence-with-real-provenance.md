---
title: "Record current-run test evidence with real provenance"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, provenance]
file_type: rules
---

# Record current-run test evidence with real provenance

Evidence-only acceptance follow-ups must rerun the exact requested matrix in
the current caller-triggered task, even when a parent checkpoint already shows
the same tests passing. Record the task ID, actual tool-output reference, exact
command, completion timestamp, exit code, per-suite counts, and aggregate count.
This makes the new proof distinguishable from historical local GREEN evidence.

Do not invent an external gate URL or hide broader-gate failures. If a full
lint command fails in unrelated artifact preparation, preserve the exact
blocker and run the repository wrapper narrowly with only that unrelated
preparation skipped. The evidence should separately state that the focused
surface passed and that the broad gate remains blocked.
