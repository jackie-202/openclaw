---
title: "Evidence-only convergence may require an owner runtime-only revision"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, contracts, provenance, integration-testing, cross-repository]
file_type: rules
---

# Evidence-only convergence may require an owner runtime-only revision

When a consumer's accepted owner contract hashes already describe the required wire shape but the hash-matched producer runtime rejects that shape, an evidence-only follow-up cannot legitimately refresh hashes, strip consumer fields, or patch the checkout.

Require an approved immutable owner revision that keeps the accepted contract and fixture bytes unchanged while bringing the executable validator and persistence path into conformance. Verify both layers before running the consumer gate:

1. The tracked owner files match the accepted hashes.
2. The runtime intake validator accepts every required field.
3. Nested parsers accept the complete closed shape.
4. The canonical cross-repository scenarios pass without local checkout patches.

If no such revision exists, record the task as blocked at the owner boundary. A runtime RED is useful evidence, but it cannot be relabeled as GREEN or external/live convergence.
