---
title: "Preserve Aggregate Exit Status in Acceptance Evidence"
date: 2026-08-09
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, provenance]
file_type: rules
---

# Preserve Aggregate Exit Status in Acceptance Evidence

A focused sub-suite can pass while the acceptance command that owns the goal still exits nonzero. Record both facts separately: the exact passing selection and the aggregate command's exit code, failed test names, and counts.

For evidence-only follow-ups, pre-existing or unrelated failures may explain why no implementation fix is appropriate, but they do not turn a nonzero aggregate run into green evidence. Keep the canonical goal blocked until a caller-owned gate provides an inspectable passing result, rather than relabeling a local partial pass or historical checkpoint prose.
