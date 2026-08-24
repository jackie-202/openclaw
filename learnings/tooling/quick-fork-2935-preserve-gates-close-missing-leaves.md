---
title: "Acceptance replans preserve gates and close missing leaves"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, planning, evidence, cross-repository, deliberation]
file_type: rules
---

# Acceptance replans must distinguish implemented gate plumbing from missing leaves

When a prior task already implemented a strict aggregate runner and ledger validator, an acceptance replan should preserve that work and target only absent executable leaves and evidence. Rewriting the gate would add risk without addressing the rejected behavior.

For cross-repository leaves, mirrored schemas and supplied hashes do not define the dependency's callable lifecycle API. Planning can name required behavior, but implementation must first obtain authorized read access to the pinned owner source, verify revision and hashes, then build scenarios through its public APIs. If access is denied, record it as a prerequisite rather than inventing probe operations or treating another fail-closed run as completion.

Historical RED and current GREEN also have different roles. Use task evidence to link a genuine pre-implementation owner-backed failure, then capture fresh GREEN from the identical durable command. Dirty-checkout and stale-provenance preflight failures are setup evidence, not behavioral RED.
