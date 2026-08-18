---
title: "Keep focused orchestration tests complementary"
date: 2026-08-17
category: patterns
component: e2e
tags: [test-coverage, orchestration, bounds, replay, fail-closed]
---

Autoreview suggested adding replay, history-bound, and fail-closed cases to the new orchestration test. Inspection showed those contracts were already covered by narrower canonical suites such as `plugin.test.ts`, `history-read.test.ts`, `route-match.test.ts`, `km-client.test.ts`, and `final-adapter.test.ts`. Before expanding an integration harness, map each advisory gap to existing lower-level coverage. Add integration cases only when they prove cross-component wiring; avoid duplicating exhaustive boundary tests that are clearer and cheaper in their owning suites.