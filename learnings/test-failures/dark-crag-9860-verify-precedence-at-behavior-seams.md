---
title: "Verify precedence at behavior seams"
date: 2026-07-25
category: test-failures
component: shared
tags: [precedence, integration-tests, status, delivery-policy]
---

Resolver-only tests would not prove the migration complete. Focused tests covered session overrides taking precedence, `modelByChannel` supplying fresh channel models, runtime profiles contributing only thinking-related fields, native `/status` displaying the canonical model, and dispatch deriving delivery behavior from that model. When changing configuration precedence, test observable behavior at each seam rather than only testing the low-level resolver.