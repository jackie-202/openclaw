---
title: "Use a narrow host-owned dispatch facade"
date: 2026-08-02
category: architecture
component: shared
tags: [plugin-boundary, dispatch, lazy-loading, ownership]
---

Discord reply wiring was made more reliable by depending on a narrow host-owned dispatch facade rather than dynamically resolving the broad reply runtime during message processing. This keeps ownership and dependency direction explicit while preserving lazy loading. Reuse small stable facades at extension boundaries instead of exposing large runtime modules whose initialization and import behavior are harder to compose and test.
