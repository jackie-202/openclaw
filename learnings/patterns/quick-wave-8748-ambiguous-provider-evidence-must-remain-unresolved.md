---
title: "Ambiguous provider evidence must remain unresolved"
date: 2026-08-24
category: patterns
component: backend
tags: [idempotency, delivery-receipts, failure-semantics, recovery]
---

Once a provider call may have sent a message, malformed, missing, sentinel, padded, mismatched, or multi-message receipt evidence cannot safely be recorded as a terminal failure. Treat these outcomes as unknown and leave completion unresolved so recovery can classify them appropriately. Only explicit provider rejection should produce `FAILED`; only canonical single-message receipt evidence should produce `SENT`.
