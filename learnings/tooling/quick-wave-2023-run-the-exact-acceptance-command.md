---
title: "Run the exact acceptance command when command identity is part of the goal"
date: 2026-08-01
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, vitest, provenance]
file_type: rules
---

# Run the exact acceptance command when command identity is part of the goal

An implementation can have valid focused RED/GREEN proof and a successful repository-wrapper test run while acceptance still remains incomplete. If the acceptance goal names an exact command, such as `pnpm exec vitest run extensions/deliberation`, evidence from a semantically equivalent wrapper does not prove that exact Test Gate.

For an evidence-only follow-up:

1. Inspect the preserved implementation and historical proof first.
2. Do not manufacture a new RED after the fix already exists.
3. Run the caller's exact command verbatim and retain its exit code and test counts.
4. Change production code only if that exact gate exposes a task-related defect.
5. Keep unrelated build or lint failures separate from the required gate result.

In this case, the exact gate passed 6 files and 51 tests. The earlier focused proof remained valid, but it could not substitute for the missing full-plugin command evidence.
