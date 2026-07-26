---
title: "Canonical gates must record blockers and concrete local results"
date: 2026-07-25
category: tooling
component: ci-cd
tags: [acceptance, test-gate, crabbox, testbox, verification]
file_type: rules
---

# Canonical gates must record blockers and concrete local results

When an acceptance repair requires a caller-owned repository gate, remote orchestration failure is part of the evidence rather than a reason to leave the gate as `not-run`. Record each provider attempt, whether provisioning began, and why no run ID exists.

If the task explicitly permits local verification, run build, check/lint, and the registered full-test command serially. Preserve exact exit outcomes and separate task-related focused GREEN from unrelated dirty-worktree failures. Do not relabel a partially failing repository gate as passing, but do provide a concrete inspectable result.

For evidence-only repairs, the final note should contain the historical RED/GREEN link, fresh focused test counts, exact affected-path diff-stat command and output, and required implementation dispositions. This makes acceptance independently auditable even when broad infrastructure is unavailable.