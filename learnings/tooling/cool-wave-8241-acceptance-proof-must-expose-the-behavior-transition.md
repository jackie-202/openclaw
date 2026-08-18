---
title: "Acceptance proof must expose the behavior transition"
date: 2026-08-17
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, checkpoints]
---

A mandatory TDD artifact was rejected even though RED metadata contained a nonzero exit code and later summaries reported passing tests. The visible RED output did not show the relevant assertion failing, and no behavior-linked GREEN phase was present.

For acceptance evidence, capture the exact focused command, the intended failing assertion and output during RED, then the same command and successful outcome during GREEN. Exit codes, aggregate pass counts, and checkpoint prose are not substitutes for a reviewable behavior transition. If implementation already exists, reuse genuine historical RED evidence rather than fabricating a new failure, and add fresh GREEN verification.