---
title: "Acceptance provenance must expose the named production boundary"
date: 2026-08-25
category: tooling
component: tooling
tags: [acceptance, task-provenance, production-diff, tdd]
file_type: rules
---

# Acceptance provenance must expose the named production boundary

When an acceptance finding says specific production files were absent from the supplied task diff, changing adjacent lifecycle, registration, test, documentation, or proof files does not repair the finding even if runtime behavior is already correct.

The follow-up should preserve the working implementation and create the smallest reviewable production diff inside every file named by the finding. For a provenance-only repair, use a bounded in-place refactor that keeps one canonical behavior path, then attach the genuine historical RED and fresh task-scoped GREEN. Do not substitute checkpoint claims for implementation material, and do not fabricate a new RED after the fix exists.
