---
title: "Obnova jednoho vlastníka finálního doručení bez návratu routingových změn"
date: 2026-08-24
category: architecture
component: general
tags: [openclaw, deliberation, service-ownership, tdd, routing]
file_type: decisions
---

# Restore an existing runtime owner without reverting adjacent contracts

When an uncommitted proposal replaces a working plugin service with a callable or second scheduler, first compare the changed files against the known-good commit. If the accepted routing/configuration work is already independent, reverse only the scheduler-specific diff: restore the service wrapper and `registerService` capture, delete callable-only files, and leave provider composition untouched.

For Deliberation, the ownership invariant is one enabled `deliberation-final-delivery` service wrapping the reservation-fenced adapter. The immediate tick plus one guarded 5-second interval preserves one-item processing and prevents overlapping provider attempts. Tests should capture the registered service directly rather than emulating it through a CLI harness.

A nearly empty final Git diff can be the correct result when the rejected architecture existed only as uncommitted work. Preserve proof with RED/GREEN output, focused routing and ambiguity tests, singleton loader/package assertions, and a repository-wide residue search for the removed callable/scheduler names.
