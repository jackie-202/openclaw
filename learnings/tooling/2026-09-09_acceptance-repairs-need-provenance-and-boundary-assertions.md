---
title: "Acceptance opravy musí oddělit chybějící důkaz od chybějící implementace"
date: 2026-09-09
category: tooling
component: ci-cd
tags: [acceptance, tdd, provenance, regression-tests]
file_type: checklist
---

# Acceptance repair: distinguish missing implementation from missing supplied evidence

When an acceptance monitor reports that production files or GREEN proof were not supplied, inspect the preserved worktree and full proof artifact before planning new code. The parent task may already contain the owner-side implementation and genuine RED/GREEN evidence even when the acceptance bundle exposed only a test-scoped diff or truncated excerpt.

For follow-up planning:

- Inventory every preserved owner file in the follow-up checkpoint so acceptance evaluates the complete outcome.
- Compare the requested regression assertions with the current test, then add only the missing assertions.
- Reuse and link genuine historical RED when implementation already exists; capture fresh GREEN under the follow-up task instead of manufacturing a new failing case.
- Add production changes only when the strengthened regression demonstrates a real behavior gap.

This keeps acceptance repairs evidence-complete without turning provenance omissions into speculative runtime changes.
