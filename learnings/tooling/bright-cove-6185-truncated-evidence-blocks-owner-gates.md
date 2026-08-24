---
title: "Zkracene dukazy neautorizuji cross-repository gate"
date: 2026-08-23
category: tooling
component: tooling
tags: [task-evidence, provenance, cross-repository, tdd, fail-closed]
file_type: rules
---

# Truncated predecessor evidence cannot authorize a cross-repository gate

When an owner-backed integration plan requires an exact dependency revision, artifact hashes, named scenario assignment, and exact failing selectors, aggregate historical test outcomes are insufficient authority.

For `bright-cove-6185`, the task-evidence artifact exposed the predecessor session and aggregate outcomes but explicitly marked command lines as truncated. It did not include the accepted KM SHA, contract and fixture hashes, complete OR assignment, or failed selector names. The safe action was to stop before changing tests or production code, record a blocked RED phase, and avoid treating a checkout/hash setup failure as behavioral RED.

Use this sequence for similar gates:

1. Generate the predecessor task-evidence artifact.
2. Confirm every plan-required authority value is present and unambiguous.
3. Pin and verify a clean owner checkout before writing a behavioral test.
4. If evidence is incomplete, checkpoint the missing values explicitly. Do not infer them from local mirrors, aggregate counts, or nearby snapshots.
