---
title: "Evidence-only TDD follow-ups preserve historical RED provenance"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, regression-tests]
file_type: rules
---

# Evidence-only TDD follow-ups must preserve historical RED provenance

When an acceptance follow-up starts after the production fix already exists, do
not force a new failure by reverting code or weakening tests. Link the original
run-scoped proof containing the genuine pre-implementation RED, then capture a
fresh GREEN with the same focused command.

For a test-result acceptance goal, also run the complete named regression
surface rather than relying on a checkpoint summary. Record the exact command,
exit status, per-shard counts, and aggregate count in the follow-up proof. Keep
the follow-up evidence-only unless those fresh tests reveal a real defect.

In this case, the exact Discord suite proved 105 tests and the wider matrix
proved 353 tests across Deliberation, Discord inbound, shared dispatch, and
loader-backed source-checkout runtime. This supplied the missing evidence
without disturbing the preserved implementation.
