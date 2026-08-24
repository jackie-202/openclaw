---
title: "Audit terminal state separately from remediation proof"
date: 2026-08-23
category: tooling
component: tooling
tags: [audit, remediation, evidence, acceptance, task-state]
file_type: rules
---

# Audit terminal state separately from remediation proof

When an investigation audits a remediation batch, keep task bookkeeping, acceptance decisions, historical command output, current-checkout behavior, package inventory, and dependency-owner execution as separate evidence layers.

A terminal batch classification such as `settled_unsuccessful` does not identify which obligations are fixed. Likewise, a nominal acceptance result cannot override a checkpoint that records missing authentic RED, an unrun canonical gate, an orphaned implementation commit, or a failed owner-runtime command.

Build the audit lineage from root task through every same-slot follow-up, then map each obligation to current source and executable evidence. Mark unsupported bookkeeping explicitly instead of inferring success or failure from terminal state alone.
