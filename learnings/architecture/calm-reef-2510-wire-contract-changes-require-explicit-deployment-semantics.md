---
title: "Wire contract changes require explicit deployment semantics"
date: 2026-08-21
category: architecture
component: shared
tags: [wire-contract, versioning, rolling-upgrade, compatibility, fail-closed]
---

Making fields required while retaining the same protocol version normally breaks independently deployed older consumers during rolling upgrades. It was acceptable here only because producer and owner contracts were an atomic, synchronized replacement that had never shipped, and old instances were intentionally allowed to fail closed. Reuse this exception only with evidence that the contract is unshipped and deployed atomically; otherwise introduce a protocol version or capability transition rather than silently redefining an existing version.
