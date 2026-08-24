---
title: "Passing tests can preserve unsafe contracts"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [testing, contracts, build, acceptance]
file_type: rules
---

# Passing tests can preserve unsafe contracts

A green focused suite is not positive safety evidence when its assertions encode the behavior under audit. In the Deliberation audit, local suites passed while explicitly accepting `DELIVERY_UNKNOWN` followed by a successful attempt, timeout as definitive `FAILED`, and 60-second multi-message records.

## Audit rule

For compatibility and rollout audits, record both the exit code and the semantic claim exercised by each test. Classify a green test as contradictory evidence when it preserves an unsafe contract. Compare source-helper tests with built-artifact inventory, dedicated build smokes, and real owner-runtime execution before assigning `PROVEN`. Historical package GREEN is superseded when the current tracked build inventory omits the artifact.

## Evidence order

1. Current tracked/build/package activation path.
2. Real owner or dependency execution at the accepted boundary.
3. Composed behavior tests with safe assertions.
4. Focused helper and schema self-tests.
5. Task terminal state and acceptance bookkeeping only as lineage metadata.
