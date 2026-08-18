---
title: "Acceptance repair plans must gate active rollout evidence"
date: 2026-08-18
category: tooling
component: ci-cd
tags: [acceptance, deliberation, rollout, tdd, evidence]
file_type: rules
---

# Planning Acceptance Repairs

When a previous Deliberation acceptance attempt proves that source and an emitted artifact register the sender but does not restart the serving Gateway, classify the remaining work as deployment/process drift rather than another source-registration defect.

The follow-up plan must make owner-authorized deployment, active-process identity, and read-only `SENT`/single-attempt/provider-receipt evidence completion gates. Do not manufacture TDD RED by inverting an existing assertion; use a fresh isolated `READY_TO_SEND` test only if it reveals a current source defect, otherwise preserve its fresh GREEN separately from live rollout proof.
