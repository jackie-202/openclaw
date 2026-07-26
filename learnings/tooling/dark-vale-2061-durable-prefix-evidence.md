---
title: "Append-only claims need post-edit prefix evidence"
date: 2026-07-25
category: tooling
component: general
tags: [acceptance, evidence, sha256, append-only]
file_type: rules
---

# Append-only claims need post-edit prefix evidence

Recording a file's byte count and digest before an append does not by itself prove append-only preservation. Closure evidence must also hash exactly that original byte range after the edit and record the comparison outcome.

For the architecture-review correction, the durable check was:

```sh
dd if=".architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md" bs=1 count=6776 2>/dev/null | shasum -a 256
```

The result matched the pre-append SHA-256, so the closure report could state a concrete `PASS` rather than leaving a future-tense validation instruction.

## Rule

For append-only evidence artifacts, record all four facts durably:

1. Original byte count.
2. Original digest.
3. Exact post-edit prefix-hash command and observed digest.
4. Explicit equality result.

A pre-edit digest plus "validation must confirm" is an incomplete acceptance artifact, even when the append visually appears correct.
