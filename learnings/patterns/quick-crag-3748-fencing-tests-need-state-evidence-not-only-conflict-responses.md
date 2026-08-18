---
title: "Fencing tests need state evidence, not only conflict responses"
date: 2026-08-14
category: patterns
component: e2e
tags: [cas, durable-fencing, negative-testing, state-integrity]
---

Asserting that mismatched invocation or completion requests returned `409 CAS_CONFLICT` was insufficient: an implementation could return the conflict while still persisting incorrect evidence. Weak inequality checks also passed when an attempt was absent or contained unrelated bad data.

Snapshot the durable attempt projection before each rejected mutation and compare it exactly afterward. Then verify the valid completion preserves the expected target and invocation identity. Negative tests should prove both rejection and absence of side effects.