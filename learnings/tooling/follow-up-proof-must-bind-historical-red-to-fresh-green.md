---
title: "Bind historical RED to fresh follow-up GREEN"
date: 2026-08-25
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, provenance]
file_type: rules
---

# Bind historical RED to fresh follow-up GREEN

An evidence-only acceptance repair must not manufacture a new failing test after the implementation exists. Preserve the original pre-implementation RED by linking its immutable artifact, including the exact command, timestamp, exit code, failure count, and expected failure reason.

Then rerun the identical focused command under the follow-up task and record fresh GREEN provenance with its own timestamp, exit code, and aggregate test totals. A separate acceptance evidence file should map both phases to the blocking finding and explicitly exclude weaker task-history summaries whose commands or outcomes were truncated.

This keeps two claims distinct: the parent artifact proves tests genuinely failed before implementation, while the follow-up run proves the preserved implementation currently passes. Recreating RED would falsify chronology; reusing only the parent's old GREEN would fail to establish follow-up-scoped verification.
