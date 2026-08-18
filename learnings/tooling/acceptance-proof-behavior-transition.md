---
title: "Acceptance proof must expose the behavior transition"
date: 2026-08-17
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, checkpoints, provenance]
file_type: rules
---

# Acceptance proof must expose the behavior transition

When a TDD artifact is consumed through a bounded acceptance context, an exit code and aggregate totals are not enough. The visible RED evidence must include the actual failing assertion for the requested behavior, and GREEN must show the same command and assertion passing.

For an acceptance follow-up after production code already exists, do not manufacture a new RED by reverting or weakening the implementation. Link the genuine parent proof, preserve its exact command and behavior-linked failure excerpt, and capture a fresh GREEN run under the follow-up task. This keeps the evidence trustworthy while making the bounded artifact self-contained.

Also keep acceptance notes separate from checkpoints. A checkpoint can summarize progress, but an explicit final note should map each verification command to its outcome, distinguish unrelated tool blockers from product failures, and record intentional contract overlays and unresolved provenance inputs.
