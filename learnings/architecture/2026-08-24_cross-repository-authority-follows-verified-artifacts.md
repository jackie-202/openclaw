---
title: "Cross-repository authority follows verified artifacts, not moving HEAD"
date: 2026-08-24
category: architecture
component: shared
tags: [deliberation, cross-repository, contracts, provenance, integration-testing]
file_type: rules
---

# Hash-authoritative cross-repository planning

When an owner repository keeps moving, pinning its whole HEAD can turn unrelated commits into false integration blockers. For Deliberation convergence, the stable authority is the accepted SHA-256 bundle for the exact contract, fixtures, wire implementation, and spool-contract implementation; current HEAD is useful only as run provenance.

The implementation gate should therefore:

1. Print current owner HEAD.
2. Hash only the named authoritative files.
3. Continue despite unrelated commits or dirty paths when all accepted hashes match.
4. Stop with the exact path, expected hash, and actual hash when one differs.

Repository-local mirrors and green schema tests are not substitutes for this preflight or for executable owner-backed behavior. After the hash gate, named integration leaves must exercise the consumer producer/client/adapter against an isolated real owner listener rather than merely spawning owner unit tests under consumer-owned labels.
