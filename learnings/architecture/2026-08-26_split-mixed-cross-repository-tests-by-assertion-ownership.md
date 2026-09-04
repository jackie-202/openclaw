---
title: "Split mixed cross-repository tests by assertion ownership"
date: 2026-08-26
category: architecture
component: shared
tags: [openclaw, deliberation, contract-testing, ownership, cross-repository]
file_type: rules
---

# Split mixed cross-repository tests by assertion ownership

When an OpenClaw test launches an external implementation, deleting the harness is not enough: one test can mix consumer assertions with owner-state assertions.

Before removal, classify each assertion rather than each test file:

- Keep request construction, response parsing, routing, provider-call ordering, receipt validation, and fail-closed behavior in OpenClaw using a repository-local fake at the public HTTP boundary.
- Move or remove durable record counts, spool mutation, restart reconciliation, and external migrations because they belong to the external implementation owner.
- Do not build a local fake state machine to preserve historical acceptance counts. That copies implementation ownership and creates a second contract.
- Derive acceptance totals from the retained local manifest; sparse historical leaf IDs are preferable to claiming removed implementation behavior is still covered.

Health and provenance metadata require the same split. A consumer may validate behavior/version/capability fields it uses, but source filenames, checkout roots, Git revisions, and implementation hashes are not public adapter identity.
