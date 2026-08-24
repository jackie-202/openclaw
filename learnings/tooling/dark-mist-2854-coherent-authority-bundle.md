---
title: "Cross-repository acceptance needs one coherent authority bundle"
date: 2026-08-23
category: tooling
component: tooling
tags: [cross-repository, provenance, acceptance, tdd, authority]
file_type: rules
---

# Cross-repository acceptance needs one coherent authority bundle

Historical artifacts can contain several individually valid KM revisions, hashes, and GREEN runs while still failing to authorize the current acceptance task. A usable authority bundle must bind one full immutable commit to its contract and fixture hashes, exercised runtime-module hashes, complete named scenario assignment, and exact owner E2E selectors.

Before planning implementation:

1. Separate repository-local semantic proof from owner-runtime authority.
2. Reject short revisions, current-branch snapshots, hash-only matches, aggregate test counts, and evidence assembled across different owner revisions.
3. Preserve a genuine historical behavioral RED when available, but do not rerun a forbidden or unapproved checkout merely to keep command text identical.
4. Capture fresh GREEN against the approved clean checkout and record the root-path change explicitly.
5. Diff preserved worktree changes against the approved owner before editing so an acceptance fix does not redo completed work.

This keeps setup/provenance failures distinct from behavioral RED and prevents unrelated historical successes from being relabeled as current cross-repository convergence.
