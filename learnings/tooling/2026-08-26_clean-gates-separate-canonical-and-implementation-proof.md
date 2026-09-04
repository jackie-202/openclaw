---
title: "Separate canonical clean-checkout evidence from implementation-time isolation proof"
date: 2026-08-26
category: tooling
component: ci-cd
tags: [openclaw, acceptance-gates, isolation, clean-checkout, tdd]
file_type: rules
---

# Separate canonical clean-checkout evidence from implementation-time isolation proof

A canonical acceptance gate can require a clean revision so command identities and artifact digests are immutable. That same preflight prevents the gate from running while a TDD implementation is still an uncommitted patch.

Do not weaken the clean-checkout rule or add an `allow-dirty` escape hatch just to obtain local GREEN. Use two proof layers:

- Repository-local tests validate manifest derivation, command/report binding, negative ledger cases, and absence of external checkout inputs while the patch is dirty.
- The canonical full gate runs after the change is committed by the owning workflow and produces the revision-bound artifact.

For dependency-direction cleanup, run the canonical command under a sanitized environment even when it is expected to stop at cleanliness preflight. Reaching that preflight without resolving an external root proves startup no longer depends on the removed checkout, but it is not a substitute for the later clean candidate run.

Report the distinction explicitly: local behavior and isolation proof can be Green while canonical immutable-artifact proof remains blocked on a clean revision.
