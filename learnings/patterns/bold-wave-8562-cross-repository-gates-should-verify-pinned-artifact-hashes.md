---
title: "Cross-repository gates should verify pinned artifact hashes"
date: 2026-08-25
category: patterns
component: e2e
tags: [cross-repo, provenance, artifact-hashes, integration-tests]
---

Direct inspection of the approved KM checkout was unavailable under the tool's directory permissions. The integration gate remained trustworthy because it independently verified the four owner artifact SHA-256 hashes before running all 39 lifecycle scenarios and reported the external HEAD only as provenance. For cross-repository integration tests, pin and verify the exact contract and implementation artifacts inside the executable gate. This avoids silently testing against a drifting checkout and allows verification without requiring broad read access to the external repository.
