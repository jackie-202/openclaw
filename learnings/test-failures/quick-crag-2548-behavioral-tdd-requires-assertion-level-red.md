---
title: "Behavioral TDD requires assertion-level RED"
date: 2026-07-27
category: test-failures
component: general
tags: [tdd, red-green, acceptance, test-provenance]
---

A missing module or nonexistent plugin target is not meaningful behavioral RED: it proves only that the implementation is absent, not that the intended behavior is correctly specified by a failing assertion. Preserve genuine historical RED evidence, but require tests to load an inert scaffold and fail at the assertion level before claiming behavioral TDD provenance. Likewise, unrelated passing baseline tests must not be reported as implementation GREEN when the target remains blocked.
