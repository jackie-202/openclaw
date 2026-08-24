---
title: "TDD proof must use the identical behavioral command"
date: 2026-08-22
category: test-failures
component: ci-cd
tags: [tdd, evidence, red-green, acceptance]
---

Several acceptance follow-ups failed because RED and GREEN records used different commands, omitted GREEN output, or reused a historical RED for unrelated behavior. Narrative checkpoint summaries were not accepted as substitutes. When TDD evidence is mandatory, capture a genuine behavior-specific RED and a subsequent GREEN from the identical focused command, with command provenance and outcomes stored in the canonical proof artifact.
