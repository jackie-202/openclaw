---
title: "Ruční odstranění funkce ověřujte proti parentu i upstreamu"
date: 2026-07-19
category: tooling
component: general
tags: [git, feature-removal, upstream, verification, openclaw]
file_type: checklist
---

# Manual feature removal needs two comparison baselines

When deleting a fork-only feature from files that continued evolving, neither a whole-commit revert nor direct equality with current upstream is sufficient proof.

Use the feature commit's parent as the subtraction baseline for the exact touched seams:

```bash
git diff <feature-commit>^ -- <feature-owned-paths>
```

An empty diff proves the complete propagation chain was restored. A small remaining diff must be traced to a later commit and explained, such as widening a shared diagnostics union for a separate window writer.

Then compare the final files with `upstream/main` separately. This identifies broader branch evolution that should not be pulled into the cleanup, such as JSONL/window trajectory storage on an older stable fork versus SQLite trajectory storage on current upstream.

For negative feature removal, exhaustive symbol greps are part of behavior proof. Check the public switch, constructor/helper names, payload fields, and every propagation name across the owner paths. Pair those checks with focused tests that cover the restored default path, rather than retaining tests for the deleted branch.

This approach kept later diagnostics typing while proving that two fork-only feature chains were otherwise fully removed.
