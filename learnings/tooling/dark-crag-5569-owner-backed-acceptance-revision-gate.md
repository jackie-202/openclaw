---
title: "Owner-backed acceptance fixes must preserve the revision gate"
date: 2026-08-23
category: tooling
component: general
tags: [openclaw, km-deliberation, acceptance, tdd, immutable-owner]
file_type: rules
---

# Owner-backed acceptance fixes must preserve the revision gate

When a follow-up is created because implementation was missing, that urgency does not relax an immutable owner-bundle precondition. A matching contract file hash proves content identity for one artifact, but it does not prove that the checkout is at the approved revision or that the other owner runtime files belong to the same coherent bundle.

The repository integration harness can reveal useful read-only evidence even when direct access to the external checkout is sandbox-denied. In this case it proved the contract file had the supplied SHA-256 while also showing OpenClaw provenance was stale. That output is still a setup/preflight failure, not behavioral RED and not permission to regenerate mirrors.

For future acceptance follow-ups:

1. Preserve the genuine historical behavioral RED in the new task proof.
2. Verify revision, scoped cleanliness, and every supplied hash before any test or production edit.
3. If the revision cannot be verified or is known to differ, record the blocker incrementally and stop.
4. Never claim GREEN from a run that failed before owner-backed behavior executed.
