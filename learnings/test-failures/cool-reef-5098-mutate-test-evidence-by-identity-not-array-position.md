---
title: "Mutate test evidence by identity, not array position"
date: 2026-08-26
category: test-failures
component: tooling
tags: [fixtures, semantic-selectors, manifest, refactoring]
---

After the gate manifest shrank from more than twenty rows to eight owned leaves, a negative test still mutated `final.leaves[10]`. The intended validation test failed with `Cannot set properties of undefined` before reaching the validator.

When fixtures are derived from a changing manifest, locate evidence by a stable semantic key such as leaf ID, authority, or exact test title, and assert that the target exists before mutation. Avoid positional indexes and hard-coded cardinalities in tamper tests. Derive expected candidate and final counts from the retained manifest so ownership changes do not silently invalidate fixtures.
