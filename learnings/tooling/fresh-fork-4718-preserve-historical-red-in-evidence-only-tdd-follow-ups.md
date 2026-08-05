---
title: "Preserve historical RED in evidence-only TDD follow-ups"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [tdd, acceptance, evidence, regression-tests]
---

When a follow-up task only validates an already implemented change, manufacturing a new failure or modifying production code solely to produce RED evidence is inappropriate. Reuse the genuine failing command and output from the parent task, explicitly identify it as historical RED provenance, then record fresh GREEN results from the same focused command and a broader regression matrix. This preserves an honest RED/GREEN chain while keeping evidence-only acceptance work free of unnecessary production changes.
