---
title: "Split cross-repository tests by assertion ownership"
date: 2026-08-26
category: architecture
component: shared
tags: [cross-repository, contracts, test-ownership, dependency-direction]
---

The Deliberation gate previously depended on a KM checkout, external Python harnesses, JUnit evidence, file hashes, and source-file identities. This reversed the intended dependency direction and made OpenClaw validation depend on implementation details from another repository.

The gate was reduced to OpenClaw-owned contract, client, routing, delivery, and fail-closed assertions. KM listener, storage, restart, reconciliation, migration, and true cross-repository E2E coverage remain the caller repository's responsibility.

Reuse this boundary: each repository should validate its public contract and behavior locally, while the repository that composes both systems owns cross-repository E2E tests. Avoid using external source paths, filenames, Git state, or implementation hashes as protocol authority.
