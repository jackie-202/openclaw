---
title: "Ukládej úplný acceptance důkaz do trvalého artefaktu"
date: 2026-07-19
category: tooling
component: ci-cd
tags: [acceptance, evidence, grep, checkpoints]
file_type: checklist
---

# Make exhaustive acceptance evidence durable

When acceptance requires complete command output plus line-by-line classification, the final response and a summary checkpoint are not reliable evidence stores. Create a dedicated checkpoint artifact that contains the verbatim output, one classification row per `file:line`, category totals, and an explicit equation reconciling those totals to the raw match count.

For scoped negative claims, distinguish production from tests. A grep match under a runtime subtree can be an intentional negative test fixture; preserve the complete scoped output and classify it instead of claiming the subtree has zero textual matches.

Plans for evidence-only retries should name the durable artifact path and require the task checkpoint to link it. This prevents a second acceptance failure caused by an implementation log or final note omitting output that was generated during the session.
