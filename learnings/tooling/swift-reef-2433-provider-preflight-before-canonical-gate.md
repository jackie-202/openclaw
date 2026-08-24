---
title: "Kanonický gate vyžaduje preflight každého poskytovatele"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, test-gate, crabbox, testbox, provenance]
file_type: checklist
---

# Preflight every canonical gate provider before promising a run reference

For evidence-only acceptance retries, verify runner allocation prerequisites before starting the expensive canonical command. OpenClaw can expose three owner-routed paths with distinct failure modes:

- Blacksmith Testbox requires the `blacksmith` executable before Crabbox can allocate a `tbx_...` session.
- Azure Crabbox requires the Azure CLI and an authenticated subscription or `AZURE_SUBSCRIPTION_ID` before allocating a lease.
- AWS Crabbox requires usable broker or AWS credentials; a local Crabbox binary alone is not sufficient.

A provider failure before allocation produces no durable run ID and means the test command never executed. Record the exact command, provider-specific error, and absence of a lease ID, but keep the canonical gate status blocked. Focused local results and historical package/build evidence must not be relabeled as a caller-owned canonical pass.
