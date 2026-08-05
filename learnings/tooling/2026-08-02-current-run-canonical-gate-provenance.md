---
title: "Canonical gate evidence must belong to the current acceptance run"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, checkpoint]
file_type: rules
---

# Canonical gate evidence must belong to the current acceptance run

A passing local checkpoint can still fail acceptance when the caller-owned Test Gate reference for that run is `canonical:not-run`. The checkpoint proves repository behavior, but it does not prove that the acceptance system observed or owned the gate result.

For evidence-only retries, preserve historical RED/GREEN artifacts and request one inspectable canonical run tied to the current acceptance attempt. Record its reference, exact command, exit code, timestamp, and named test counts. Do not rerun the same tests locally and relabel that output as canonical evidence.

If the canonical runner executes a broad registered command, its logs must still identify the required test file or named cases as passing. Otherwise leave the goal blocked rather than inferring coverage from a successful aggregate exit.
