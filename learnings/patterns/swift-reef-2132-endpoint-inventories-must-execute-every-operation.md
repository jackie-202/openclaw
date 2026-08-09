---
title: "Endpoint inventories must execute every operation"
date: 2026-08-09
category: patterns
component: backend
tags: [api-contract, endpoint-coverage, integration-tests, deliberation]
---

The endpoint-path contract test described six canonical paths and omitted the active invocation operation. Static expected-path lists can remain green while an operation is never exercised. Reuse the pattern of invoking every active client operation, recording its requested path, and asserting the complete ordered inventory; this verifies both endpoint presence and actual client wiring.
