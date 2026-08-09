---
title: "Cross-repository spool tests need guards at every constructor boundary"
date: 2026-08-09
category: architecture
component: e2e
tags: [deliberation, integration-tests, sqlite, process-cleanup, path-isolation]
file_type: checklist
---

# Cross-repository spool tests need guards at every constructor boundary

An integration listener can reject production paths correctly while a test-only setup or inspection probe still opens the production database first. Any helper that constructs `DeliberationSpool(root)` must independently validate the resolved test root, sentinel, containment, and overlap with KM's exported canonical root before invoking the constructor.

The process owner also needs cleanup before filesystem cleanup. Retain the child as soon as `spawn()` returns; if readiness parsing, timeout, or callback execution fails, terminate and await the child before removing its temporary root. Testing only successful shutdown misses the startup-failure leak.

For Deliberation intake, a fresh spool defaults `source-intake` to disabled and successful HTTP intake leaves the record in `DEBOUNCING`. The isolated harness should enable intake through the public `set_control` API and assert the real post-intake state rather than inventing a later drafting/review transition.
