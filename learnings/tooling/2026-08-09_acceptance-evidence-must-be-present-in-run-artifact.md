---
title: "Acceptance evidence must be present in the supplied run artifact"
date: 2026-08-09
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, provenance]
file_type: rules
---

# Acceptance evidence must be present in the supplied run artifact

A valid RED/GREEN proof may already exist in the workspace while acceptance still rejects the task because the evaluator did not receive the complete artifact version. Before changing working implementation, compare the finalized acceptance result, the current proof file, and independently recovered task evidence.

For an evidence-only follow-up, create one task-scoped proof that visibly links the immutable parent RED and contains fresh GREEN command output. A checkpoint claim or a workspace file that was not included in the acceptance input is not equivalent evidence. Preserve any task-evidence gaps verbatim and do not recreate RED after the fix exists.
