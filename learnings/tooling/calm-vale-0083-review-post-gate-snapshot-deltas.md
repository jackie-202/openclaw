---
title: "Canonical gate snapshots require post-gate delta review"
date: 2026-08-24
category: tooling
component: tooling
tags: [autoreview, acceptance-gates, immutable-evidence, focused-tests]
file_type: checklist
---

# Review the exact post-gate snapshot, not only the gate repair commit

A canonical acceptance gate can pass from an immutable snapshot while a later test-only snapshot change still introduces a regression outside the gate's selected suites. In `calm-vale-0083`, the OR-01 through OR-23 ledger was valid, but a later Slack fixture change removed the mocked claim boundary and required logger while retaining expectations that only make sense after ordinary enqueue.

The reliable closeout pattern is:

1. Preserve and validate the canonical ledger independently. Its revision, ordered leaves, command identities, candidate digest, artifact hash, and file mode remain immutable evidence.
2. Review the bounded repair commit with autoreview.
3. Review every post-repair delta separately, even when described as a type-only or fixture-only correction.
4. Run the exact changed fixture suite after review. A broad canonical gate may not select that sibling test.
5. If the shared worktree changes concurrently, compare blob hashes against the reviewed revisions before editing. Preserve a concurrent correction rather than overwriting it.

This separates two claims that should not be conflated: the canonical ledger truthfully proves the selected 23-leaf repository gate at its immutable revision, while the current worktree still needs independent focused review and tests for later deltas.
