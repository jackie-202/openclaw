---
title: "Evidence-only TDD follow-ups must fail closed on missing RED provenance"
date: 2026-08-21
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, provenance]
file_type: rules
---

# Evidence-only TDD follow-ups must fail closed on missing RED provenance

When an acceptance repair is already implemented, a passing focused command proves only GREEN. A prior RED is credible only when task lineage preserves the same command, a nonzero outcome, and a failure tied to the repaired behavior.

Do not recreate RED by reverting correct code, forcing an assertion failure, or substituting an unrelated test's historical failure. Search the task evidence lineage first; if the exact behavior-specific RED cannot be recovered, record the provenance gap and escalate instead of claiming TDD completion.
