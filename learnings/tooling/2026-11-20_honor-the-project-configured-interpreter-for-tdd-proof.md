---
title: "Honor the project-configured interpreter for TDD proof"
date: 2026-11-20
category: tooling
component: tooling
tags: [tdd, python, interpreter, environment]
file_type: rules
---

# Honor the project-configured interpreter for TDD proof

The required TDD helper depends on the interpreter version declared by the project (`.python-version` specified Python 3.15.0). When that interpreter could not be resolved because `pyenv` was unavailable, the task correctly stopped before running tests or editing production code; substituting an unconfigured system Python would not produce valid project proof. Reuse this approach: resolve the configured runtime first, then run the prescribed RED/GREEN cycle. Record the blocker and resume context so work can continue once the runtime is available.

## Context

Extracted from task: [acceptance-fix] Deliverable: repair reasoning-catalog type consistency blocking the complete fork b
