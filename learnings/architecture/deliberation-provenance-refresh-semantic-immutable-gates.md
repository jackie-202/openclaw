---
title: "Deliberation provenance refresh needs semantic and immutable gates"
date: 2026-08-17
category: architecture
component: tooling
tags: [deliberation, provenance, contracts, verification]
file_type: rules
---

# Provenance refresh requires two independent gates

For a cross-repository Deliberation provenance refresh, a manifest hash update is valid only after two separate checks:

1. Prove the read-only owner checkout is clean and identify the immutable `HEAD` that contains both pinned files.
2. Compare the owner contract and fixtures semantically with the OpenClaw generic wire mirror and the separate provider overlay.

The cross-repository harness validates `ownerFiles` before it exercises its isolated listener assertions. Clearing that preflight alone is not integration proof. If owner metadata or semantic comparison cannot be read, keep the manifest unchanged and record the exact blocking evidence instead of reusing an older OpenClaw revision.
