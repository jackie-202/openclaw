---
title: "Snapshot candidate evidence before final integrity"
date: 2026-08-24
category: tooling
component: ci-cd
tags: [acceptance-ledger, immutable-evidence, stale-evidence, clean-checkout]
file_type: rules
---

# Snapshot candidate evidence before the final integrity leaf

A multi-stage acceptance ledger must snapshot its provisional evidence before running the final integrity leaf. Reusing mutable `commands` and `leaves` arrays means appending OR-23 also mutates the candidate object, so its later digest no longer matches the 22-row candidate reconstructed by final validation.

Use copied arrays when constructing the candidate:

```ts
const candidate = {
  ...provisional,
  commands: [...commands],
  leaves: [...leaves],
};
```

Final validation also needs two independent freshness checks. A fresh `finalizedAt` must not make an old `candidateCreatedAt` acceptable. Check both timestamps against the same bounded window, in addition to enforcing monotonic ordering.

When a canonical evidence gate requires a clean checkout, do not weaken that preflight merely because the implementation workspace is shared and dirty. Run narrow owner/build/package checks to identify code defects, but leave the final artifact and readiness Green absent until an authorized clean checkout can run the canonical command.
