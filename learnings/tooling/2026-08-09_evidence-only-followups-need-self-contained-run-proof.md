---
title: "Evidence-only follow-ups need one self-contained run artifact"
date: 2026-08-09
category: tooling
component: tooling
tags: [acceptance, tdd, evidence, checkpoints]
file_type: rules
---

# Evidence-only follow-ups need one self-contained run artifact

Acceptance evaluates the evidence supplied for a specific run, not every file that may exist elsewhere in the workspace. A parent task can have a genuine RED/GREEN proof on disk and still need an evidence follow-up if the accepted artifact omitted one phase.

For an already-implemented fix, do not manufacture a new RED. Create the follow-up proof before any further code change, identify the parent proof as provenance, reproduce its genuine failing command and result, then run the identical focused command against the preserved implementation and capture fresh GREEN output. The follow-up artifact should state why historical RED was reused and should carry both phase headings, exit codes, and pass/fail counts so it is independently reviewable.
