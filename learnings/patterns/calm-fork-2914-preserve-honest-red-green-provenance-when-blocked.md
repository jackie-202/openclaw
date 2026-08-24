---
title: "Preserve honest RED/GREEN provenance when blocked"
date: 2026-08-23
category: patterns
component: tooling
tags: [tdd, proof-file, checkpoint, evidence]
---

The revision gate failed before implementation, so no legitimate GREEN result or focused test run could be produced. The run preserved historical RED provenance in the proof file and recorded the blocker in the checkpoint instead of fabricating completion evidence. Reuse this pattern for interrupted TDD workflows: distinguish historical evidence from commands executed in the current run, record the failed prerequisite durably, and append GREEN evidence only after production changes and passing tests actually occur.
