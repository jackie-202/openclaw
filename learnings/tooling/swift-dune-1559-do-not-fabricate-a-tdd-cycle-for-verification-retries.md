---
title: "Do not fabricate a TDD cycle for verification retries"
date: 2026-07-24
category: tooling
component: ci-cd
tags: [tdd, evidence, acceptance, proof-capture]
---

The proof helper rejected a standalone GREEN because the follow-up task had no locally captured RED. Creating an artificial failure would have misrepresented implementation history. For evidence-only or acceptance-retry tasks, reference the genuine parent RED/GREEN proof and record current passing commands as fresh verification, not as a new TDD cycle.