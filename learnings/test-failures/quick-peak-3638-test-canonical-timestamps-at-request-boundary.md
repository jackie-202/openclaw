---
title: "Test canonical timestamps at the serialized request boundary"
date: 2026-08-04
category: test-failures
component: backend
tags: [deliberation, timestamps, wire-contract, tdd, request-boundary]
file_type: rules
---

# Test canonical timestamps at the serialized request boundary

When an external API accepts only a canonical UTC representation, a handler test with a mocked client can preserve the wrong wire value because the mock accepts every string. For Deliberation intake, `Date.toISOString()` always emits `.000Z`, while the KM canonical form requires exact seconds to end in `Z` and non-zero milliseconds to remain intact.

Add a listener-shaped `fetch` test through the real client: parse the outgoing JSON, reject `.000Z` as the KM does, and return a valid intake response only for canonical values. Pair an exact-second case, which supplies genuine RED against raw `toISOString()`, with a non-zero case such as `.120Z`, which prevents an over-broad fraction removal.

Keep the normalization seam where the intake payload is constructed and remove only a terminal `.000Z`. This leaves routing, duplicate handling, terminal claim behavior, and the independent fail-closed dispatch guard untouched.
