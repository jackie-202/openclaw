---
title: "Reuse only behavior-equivalent historical RED for evidence repairs"
date: 2026-08-09
category: test-failures
component: tooling
tags: [tdd, evidence, provenance, acceptance, deliberation]
file_type: rules
---

# Reuse only behavior-equivalent historical RED for evidence repairs

An evidence-only TDD follow-up must not manufacture failure by reverting correct production code. Search the task lineage for a genuine pre-implementation failure at the same behavioral boundary, then verify that it exercises the same implementation branch as the current regression.

For Deliberation timestamps, the accepted historical authority-listener proof showed `.120Z` rejected until serialization produced `.120000Z`. This is valid provenance for the later `.816Z` case because `Date#toISOString()` emits the same three-digit millisecond shape for both inputs and `canonicalUtcTimestamp()` handles all non-zero milliseconds through one branch.

Record the historical task, exact proof lines, source hash, command, nonzero exit code, and caller acceptance result. Pair that immutable RED with fresh GREEN from the current focused regression. Do not cite a test merely because it failed while displaying the relevant value; confirm the assertion failed for the target behavior rather than an unrelated object-shape mismatch.
