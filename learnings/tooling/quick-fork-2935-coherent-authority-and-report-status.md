---
title: "Cross-repository gates require coherent authority and testcase status"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, provenance, junit, vitest, fail-closed]
file_type: rules
---

# Revision and hashes form one authority bundle

A cross-repository acceptance gate must validate the dependency repository revision in addition to a small set of pinned file hashes. In this task, all four Deliberation contract hashes matched, but the configured KM repository was at a different HEAD. Lifecycle code outside those four files therefore remained mutable and could not support a trustworthy Green result.

The direct owner harness and aggregate gate should both reject this mixed state before behavioral execution:

```text
expected revision + scoped cleanliness + expected hashes
```

Matching hashes alone are useful content-integrity evidence, not runtime-authority evidence.

# Machine reports need testcase-level status

Do not collect every JUnit `<testcase>` name and subtract global failed/skipped totals. That leaves skipped or failed names eligible for acceptance selection. Parse each testcase with its body, derive its status, and expose selectors only for passed cases.

Vitest JSON has a similar normalization trap: `fullName` includes ancestor suites, while a fixed acceptance manifest usually owns the exact leaf `title`. Normalize once at report ingestion and require exact equality everywhere afterward; mixing suffix matching during extraction with exact matching during ledger validation creates a gate that can never finalize.
