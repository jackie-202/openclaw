---
title: "Evidence-only plans must target the missing authority"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [acceptance, test-gate, planning, evidence]
file_type: rules
---

# Evidence-only plans must target the missing authority

When acceptance rejects passing local tests because the caller-owned Test Gate is `not-run`, plan around obtaining that authoritative gate result rather than scheduling another local rerun. Preserve the existing RED/GREEN proof, require a current-run gate ID and inspectable logs, and keep production/test edits forbidden unless the canonical run exposes a real defect.

A broad registered gate is sufficient only when its logs identify the required test files or named cases as passing. Aggregate success without that mapping does not prove an explicit test-result goal.
