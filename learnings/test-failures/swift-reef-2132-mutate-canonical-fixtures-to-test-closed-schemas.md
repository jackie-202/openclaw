---
title: "Mutate canonical fixtures to test closed schemas"
date: 2026-08-09
category: test-failures
component: tooling
tags: [contract-tests, fixtures, closed-schema, parser-boundaries, vitest]
---

Malformed-response tests were failing at the reservation envelope parser instead of reaching the intended `reviewedTextHash` validation because their base fixtures had become stale. For strict closed-schema parsers, build each negative case from a typed, fully valid canonical fixture and override only the field under test. This keeps unrelated contract changes from masking the expected validation error and ensures assertions exercise the intended parser boundary.
