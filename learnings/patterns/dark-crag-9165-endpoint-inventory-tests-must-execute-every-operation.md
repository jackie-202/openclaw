---
title: "Endpoint inventory tests must execute every operation"
date: 2026-08-09
category: patterns
component: backend
tags: [api-contract, endpoint-inventory, coverage]
---

An endpoint allowlist test had become stale because it described six canonical paths while the client exposed seven operations. Keep endpoint inventories behavioral: execute every active client operation, including invocation, capture the requested paths, and compare the complete ordered set. Updating only the expected list is weaker because it does not prove the added endpoint is reachable through the client.
