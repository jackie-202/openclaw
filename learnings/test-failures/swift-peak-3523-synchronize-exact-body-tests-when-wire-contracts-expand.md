---
title: "Synchronize exact-body tests when wire contracts expand"
date: 2026-08-21
category: test-failures
component: backend
tags: [contracts, fixtures, vitest, intake]
---

The orchestration tests failed after intake gained required `pipelineId` and `deliveryTarget` fields because they used deep equality against the previous complete request body. The implementation was correct; the expected contract fixtures were stale. When intentionally expanding a closed wire payload, update all exact-body assertions and cross-provider fixtures together, then rerun the full bounded extension suite rather than weakening assertions to partial matching.
