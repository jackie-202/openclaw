---
title: "External authority contracts must precede plugin implementation"
date: 2026-07-27
category: architecture
component: shared
tags: [plugins, wire-contract, external-authority, http-api, reconciliation]
---

A plugin can have well-defined SDK integration seams while still being unsafe to implement when its durable external authority lacks a repository-local wire contract. The task was correctly blocked because the KM contract did not define missing-provider-ID behavior, authentication, endpoint schemas, cursor and lease semantics, reservation CAS conflicts, completion, or reconciliation proof.

Do not infer HTTP endpoints or fallback behavior from architectural invariants such as "one reserved attempt." Require authoritative schemas or fixtures first. Otherwise, mocks merely validate an API invented by the implementer and can hide authentication errors, reservation races, or unsafe retries after an unknown provider outcome.
