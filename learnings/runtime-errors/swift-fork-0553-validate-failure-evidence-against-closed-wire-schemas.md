---
title: "Validate failure evidence against closed wire schemas"
date: 2026-08-13
category: runtime-errors
component: backend
tags: [wire-contract, schema-validation, failure-evidence, km]
---

Provider failures were initially completed with `providerEvidence: { message: ... }`, while the closed KM schema permits fields such as `detail` but not `message`. KM would have rejected the failure completion with `SCHEMA_INVALID`, preventing the required terminal `FAILED` state. The evidence field was changed to `detail`. Mocks of the KM client did not expose this mismatch, so boundary tests should exercise real request serialization or validate payloads against the contract schema.